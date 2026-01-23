import smtplib
from email.mime.text import MIMEText
import os
from dotenv import load_dotenv

load_dotenv()

def test_smtp():
    host = os.getenv('SMTP_HOST', 'smtps.domainfactory.de')
    port = int(os.getenv('SMTP_PORT', 465))
    user = os.getenv('SMTP_USER')
    password = os.getenv('SMTP_PASS')
    
    print(f"Testing SMTP connection to {host}:{port} for user {user}...")
    
    try:
        # Try SSL first (Port 465)
        print("Attempting SMTP_SSL...")
        with smtplib.SMTP_SSL(host, port) as server:
            print("Connected. Logging in...")
            server.login(user, password)
            print("Login success!")
            
            msg = MIMEText("Test body")
            msg['Subject'] = "SMTP Test"
            msg['From'] = user
            msg['To'] = user
            
            server.send_message(msg)
            print("Email sent successfully!")
            
    except Exception as e:
        print(f"SMTP_SSL Failed: {e}")
        
        # Try STARTTLS (Port 587)
        try:
            print("\nAttempting STARTTLS (Port 587)...")
            with smtplib.SMTP("smtp.domainfactory.de", 587) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                print("Connected. Logging in...")
                server.login(user, password)
                print("Login success!")
                
                msg = MIMEText("Test body (STARTTLS)")
                msg['Subject'] = "SMTP Test STARTTLS"
                msg['From'] = user
                msg['To'] = user
                
                server.send_message(msg)
                print("Email sent successfully!")
        except Exception as e2:
             print(f"STARTTLS Failed: {e2}")

if __name__ == "__main__":
    test_smtp()
