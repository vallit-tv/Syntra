#!/usr/bin/env python3
"""
Initialize Vallit Company in the database.
This script creates the Vallit Company and assigns necessary initial setup.
Run this once after database setup.
"""

import sys
import os
from datetime import datetime

# Add the project directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import db
import auth

def init_vallit_company():
    """Create Vallit Company and set up initial structure"""
    
    print("=" * 60)
    print("Vallit Company Initialization")
    print("=" * 60)
    
    try:
        # Check if Vallit Company already exists
        companies = db.get_companies()
        vallit_exists = any(c.get('slug') == 'vallit-company' for c in companies)
        
        if vallit_exists:
            print("\n✓ Vallit Company already exists!")
            vallit_company = next(c for c in companies if c.get('slug') == 'vallit-company')
            print(f"  Company ID: {vallit_company['id']}")
            print(f"  Name: {vallit_company['name']}")
            print(f"  Slug: {vallit_company['slug']}")
            return vallit_company
        
        # Create Vallit Company
        print("\nCreating Vallit Company...")
        company_data = {
            'name': 'Vallit Company',
            'slug': 'vallit-company',
            'settings': {
                'description': 'The first company in Syntra',
                'industry': 'Technology',
                'created_by': 'system'
            }
        }
        
        company = db.create_company(
            name=company_data['name'],
            slug=company_data['slug'],
            settings=company_data['settings']
        )
        
        if not company:
            print("✗ Failed to create Vallit Company")
            return None
        
        print(f"✓ Vallit Company created successfully!")
        print(f"  Company ID: {company['id']}")
        print(f"  Name: {company['name']}")
        print(f"  Slug: {company['slug']}")
        
        # Check if Theo exists and assign as CEO
        print("\nChecking for Theo user...")
        theo_user = db.get_user_by_name('Theo')
        
        if theo_user:
            print("✓ Theo user found")
            
            # Check if Theo is already assigned to a company
            if theo_user.get('company_id'):
                print(f"  Note: Theo is already assigned to company {theo_user.get('company_id')}")
            else:
                # Assign Theo to Vallit Company as CEO
                print("  Assigning Theo as CEO of Vallit Company...")
                success = db.assign_user_to_company(theo_user['id'], company['id'], 'ceo')
                
                if success:
                    print("✓ Theo assigned as CEO successfully!")
                else:
                    print("✗ Failed to assign Theo as CEO")
        else:
            print("⚠ Theo user not found. You can assign a CEO later via admin panel.")
        
        print("\n" + "=" * 60)
        print("Initialization Complete!")
        print("=" * 60)
        print("\nNext steps:")
        print("1. Log in as admin to manage the company")
        print("2. Add more team members via admin panel")
        print("3. Configure workflows and integrations")
        print("\n")
        
        return company
        
    except Exception as e:
        print(f"\n✗ Error during initialization: {e}")
        import traceback
        traceback.print_exc()
        return None

def main():
    """Main entry point"""
    print("\nStarting initialization...")
    
    # Verify database connection
    try:
        db_client = db.get_db()
        print("✓ Database connection established")
    except Exception as e:
        print(f"✗ Failed to connect to database: {e}")
        print("\nMake sure:")
        print("1. Your .env file is configured correctly")
        print("2. SUPABASE_URL and SUPABASE_SERVICE_KEY are set")
        print("3. The database tables are created (run supabase_schema.sql)")
        sys.exit(1)
    
    # Initialize Vallit Company
    company = init_vallit_company()
    
    if company:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == '__main__':
    main()

