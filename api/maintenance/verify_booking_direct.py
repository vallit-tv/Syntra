import sys
import os
from datetime import datetime

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

import db
from appointment_service import AppointmentService

def verify_booking():
    print("Verifying booking for company 'wtm'...")
    company = db.get_company_by_slug('wtm')
    if not company:
        print("Company 'wtm' not found!")
        return

    print(f"Found company: {company['id']}")
    
    # Create test appointment
    appt = AppointmentService.create_appointment(
        db, 
        company['id'], 
        "manual_verification_session",
        "Test User",
        "test@wtm-consulting.de",
        "Monday 9am",
        "Verification of DB insert"
    )
    
    if appt:
        print(f"SUCCESS: Created appointment {appt['id']}")
        print(f"Record: {appt}")
        
        # Cleanup
        db.get_db().table('chat_appointments').delete().eq('id', appt['id']).execute()
        print("Cleanup complete.")
    else:
        print("FAILURE: Could not create appointment.")

if __name__ == "__main__":
    verify_booking()
