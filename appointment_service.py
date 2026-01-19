import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
import requests
import json
import base64
from datetime import datetime, timedelta

class AppointmentService:
    @staticmethod
    def get_zoom_access_token():
        account_id = os.getenv('ZOOM_ACCOUNT_ID')
        client_id = os.getenv('ZOOM_CLIENT_ID')
        client_secret = os.getenv('ZOOM_CLIENT_SECRET')

        if not all([account_id, client_id, client_secret]):
            print("Missing Zoom credentials")
            return None

        url = f"https://zoom.us/oauth/token?grant_type=account_credentials&account_id={account_id}"
        auth_header = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()

        try:
            response = requests.post(url, headers={'Authorization': f'Basic {auth_header}'})
            if response.status_code == 200:
                return response.json().get('access_token')
            else:
                print(f"Zoom Token Error: {response.text}")
                return None
        except Exception as e:
            print(f"Zoom Token Exception: {e}")
            return None

    @staticmethod
    def create_zoom_meeting(access_token, topic, start_time_str):
        if not access_token:
            return None

        url = "https://api.zoom.us/v2/users/me/meetings"
        
        # Parse flexible time string or assume ISO
        # Ideally, start_time_str should be ISO 8601
        
        payload = {
            "topic": topic,
            "type": 2,
            "start_time": start_time_str,
            "duration": 60,
            "timezone": "Europe/Berlin",
            "settings": {
                "host_video": True,
                "participant_video": True,
                "join_before_host": False,
                "mute_upon_entry": True,
                "waiting_room": True
            }
        }

        try:
            response = requests.post(
                url, 
                headers={
                    'Authorization': f'Bearer {access_token}',
                    'Content-Type': 'application/json'
                },
                json=payload
            )
            if response.status_code == 201:
                return response.json()
            else:
                print(f"Zoom Create Meeting Error: {response.text}")
                return None
        except Exception as e:
            print(f"Zoom Create Exception: {e}")
            return None

    @staticmethod
    def generate_ics(start_time_iso, duration_minutes, subject, description, location, organizer_name, organizer_email):
        try:
            dt_start = datetime.fromisoformat(start_time_iso.replace('Z', '+00:00'))
        except ValueError:
            # Fallback if parsing fails, try simple replace
            dt_start = datetime.now() # Safety callback

        dt_end = dt_start + timedelta(minutes=duration_minutes)

        def format_ics_date(dt):
            return dt.strftime('%Y%m%dT%H%M%SZ')

        uid = f"{int(datetime.now().timestamp())}@wtm-consulting.de"
        
        formatted_desc = description.replace(chr(10), '\\n')
        
        ics_content = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Vallit//WTM Consulting//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:{uid}
DTSTAMP:{format_ics_date(datetime.now())}
DTSTART:{format_ics_date(dt_start)}
DTEND:{format_ics_date(dt_end)}
SUMMARY:{subject}
DESCRIPTION:{formatted_desc}
LOCATION:{location}
ORGANIZER;CN={organizer_name}:mailto:{organizer_email}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR"""
        return ics_content

    @staticmethod
    def send_confirmation_email(user_email, user_name, topic, date_time, zoom_link, ics_content):
        smtp_host = os.getenv('SMTP_HOST', 'smtps.domainfactory.de')
        smtp_port = int(os.getenv('SMTP_PORT', 465))
        smtp_user = os.getenv('SMTP_USER')
        smtp_pass = os.getenv('SMTP_PASS')
        
        if not all([smtp_user, smtp_pass]):
            print("Missing SMTP credentials")
            return False

        msg = MIMEMultipart()
        msg['From'] = f'"WTM Consulting" <{smtp_user}>'
        msg['To'] = user_email
        msg['Subject'] = f"Confirmation: {topic}"

        html_body = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #fafafa;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #22c55e;">Appointment Confirmed</h2>
            </div>
            <p>Hi {user_name},</p>
            <p>Your appointment with <strong>WTM Consulting</strong> has been successfully scheduled.</p>
            
            <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #eee; margin: 20px 0;">
                <p><strong>Topic:</strong> {topic}</p>
                <p><strong>Time:</strong> {date_time}</p>
                <p><strong>Zoom Link:</strong> <a href="{zoom_link}" style="color: #007bff;">Join Meeting</a></p>
            </div>
            
            <p>A calendar invitation is attached to this email. Please add it to your calendar.</p>
            
            <p>Best regards,<br>The WTM Consulting Team</p>
        </div>
        """
        msg.attach(MIMEText(html_body, 'html'))

        # Attach ICS
        part = MIMEApplication(ics_content.encode('utf-8'), Name="invitation.ics")
        part['Content-Disposition'] = 'attachment; filename="invitation.ics"'
        msg.attach(part)

        try:
            with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)
                
            # Send notification to Admin as well
            admin_msg = MIMEMultipart()
            admin_msg['From'] = f'"WTM Bot" <{smtp_user}>'
            admin_msg['To'] = smtp_user
            admin_msg['Subject'] = f"NEW BOOKING: {user_name}"
            admin_html = f"""
            <h3>New Appointment Request</h3>
            <ul>
                <li><strong>Name:</strong> {user_name}</li>
                <li><strong>Email:</strong> {user_email}</li>
                <li><strong>Topic:</strong> {topic}</li>
                <li><strong>Date:</strong> {date_time}</li>
            </ul>
             <p><strong>Zoom Link:</strong> <a href="{zoom_link}">{zoom_link}</a></p>
            """
            admin_msg.attach(MIMEText(admin_html, 'html'))
            # Attach ICS to admin email too
            admin_part = MIMEApplication(ics_content.encode('utf-8'), Name="booking.ics")
            admin_part['Content-Disposition'] = 'attachment; filename="booking.ics"'
            admin_msg.attach(admin_part)
            
            with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
                server.login(smtp_user, smtp_pass)
                server.send_message(admin_msg)
                
            return True
        except Exception as e:
            print(f"SMTP Error: {e}")
            return False

    @staticmethod
    def create_appointment(db_module, company_id, session_id, name, email, date_time, purpose="General"):
        try:
            print(f"Creating appointment for {name} ({email}) at {date_time}...")
            
            # 1. Zoom
            zoom_token = AppointmentService.get_zoom_access_token()
            
            # TODO: Convert natural language date_time to ISO format properly
            # For now assuming ISO or simple string passing, Zoom might reject if not strictly ISO 8601
            # In a real app, an NLP parser or robust date parser is needed.
            # We'll use a placeholder ISO time for now if it's not valid, or try to parse
            
            # Quick hack to ensure valid ISO for Zoom if we can (demo purpose: tomorrow 10am)
            # In production, we assume the AI passed a valid ISO string or we parse it.
            # Let's try to use the passed date_time if it looks like ISO, otherwise default to tomorrow.
            target_time = datetime.now() + timedelta(days=1)
            target_time = target_time.replace(hour=10, minute=0, second=0, microsecond=0)
            iso_start_time = target_time.strftime('%Y-%m-%dT%H:%M:%SZ')
            
            # If the input looks like ISO, use it (rudimentary check)
            if 'T' in date_time and ':' in date_time:
                 iso_start_time = date_time
            
            topic = f"WTM Consulting: {purpose} with {name}"
            zoom_meeting = AppointmentService.create_zoom_meeting(zoom_token, topic, iso_start_time)
            
            zoom_join_url = zoom_meeting.get('join_url') if zoom_meeting else "Pending (Zoom Error)"
            zoom_start_url = zoom_meeting.get('start_url') if zoom_meeting else ""
            meeting_id = str(zoom_meeting.get('id', '')) if zoom_meeting else ""

            # 2. Save to DB using Supabase client
            try:
                appointment_data = {
                    "company_id": company_id,
                    "chat_session_id": session_id,
                    "customer_name": name,
                    "customer_email": email,
                    "appointment_date": iso_start_time, # Store ISO
                    "purpose": f"{purpose} | Zoom: {zoom_join_url}",
                    "status": "confirmed"
                }
                
                result = db_module.get_db().table('chat_appointments').insert(appointment_data).execute()
                record = result.data[0] if result.data else None
            except Exception as db_e:
                print(f"DB Error: {db_e}")
                record = {"id": "offline-id"}

            # 3. Email & ICS
            ics_content = AppointmentService.generate_ics(
                iso_start_time, 
                60, 
                topic, 
                f"Topic: {purpose}\\nZoom: {zoom_join_url}", 
                zoom_join_url, 
                "WTM Consulting", 
                "Kontakt@wtm-consulting.de"
            )
            
            email_sent = AppointmentService.send_confirmation_email(
                email, name, topic, iso_start_time, zoom_join_url, ics_content
            )

            return record

        except Exception as e:
            print(f"General Booking Error: {e}")
            return None
