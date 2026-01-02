from datetime import datetime
import uuid

class AppointmentService:
    @staticmethod
    def create_appointment(db_module, company_id, session_id, name, email, date_time, purpose="General"):
        """
        Create a new appointment record in the database.
        """
        try:
            db_client = db_module.get_db()
            if not db_client:
                return None
            
            # Simple validation or parsing could go here
            # For now, we trust the AI passed a reasonable string for date_time
            # Ideally this should be an ISO timestamp
            
            appointment_data = {
                'id': str(uuid.uuid4()),
                'company_id': company_id,
                'chat_session_id': session_id,
                'customer_name': name,
                'customer_email': email,
                'appointment_date': date_time, 
                'purpose': purpose,
                'status': 'pending',
                'created_at': datetime.utcnow().isoformat()
            }
            
            result = db_client.table('chat_appointments').insert(appointment_data).execute()
            
            if result.data:
                return result.data[0]
            return None
            
        except Exception as e:
            print(f"Error creating appointment: {e}")
            return None

    @staticmethod
    def get_upcoming_slots(db_module, company_id):
        """
        Mock available slots - in a real app this would check Calendar API
        """
        # Return generic availability for now
        return "Monday-Friday, 9 AM - 5 PM"
