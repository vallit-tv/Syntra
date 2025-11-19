"""
Webhook Client for n8n Automation Triggers
Handles sending webhook requests to n8n workflows.
"""

import os
import requests
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()


def trigger_daily_summary(user_id: str, meta: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Trigger the Daily Summary workflow in n8n by sending a webhook request.
    
    This function sends a POST request to the n8n webhook endpoint configured
    via the N8N_WEBHOOK_URL environment variable. The payload includes the
    user's UUID and optional metadata.
    
    Args:
        user_id: The UUID of the authenticated user (from auth.current_user()["id"])
        meta: Optional dictionary of additional metadata to include in the payload
        
    Returns:
        Dictionary with the following keys:
            - success: bool indicating if the webhook was called successfully
            - message: str with a human-readable message
            - error: Optional str with error details if success is False
            - user_id: str with the user UUID that was sent
            
    Example:
        result = trigger_daily_summary("123e4567-e89b-12d3-a456-426614174000")
        if result["success"]:
            print("Daily summary triggered successfully")
        else:
            print(f"Error: {result["error"]}")
    """
    # Get webhook URL from environment
    webhook_url = os.getenv('N8N_WEBHOOK_URL', '').strip()
    
    if not webhook_url:
        return {
            'success': False,
            'message': 'n8n webhook URL not configured',
            'error': 'N8N_WEBHOOK_URL environment variable is not set. Please configure it in your .env file.',
            'user_id': user_id
        }
    
    # Construct the payload
    payload = {
        'user_uuid': user_id,
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'source': 'vallit_frontend',
        'event': 'wake_up'
    }
    
    # Merge optional metadata if provided
    if meta:
        payload.update(meta)
    
    try:
        # Send POST request to n8n webhook
        response = requests.post(
            webhook_url,
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=30  # 30 second timeout for webhook calls
        )
        
        # Check if request was successful
        if response.status_code in [200, 201, 202]:
            return {
                'success': True,
                'message': 'Daily summary workflow triggered successfully',
                'error': None,
                'user_id': user_id,
                'status_code': response.status_code
            }
        else:
            # n8n returned an error status
            error_text = response.text[:500]  # Limit error text length
            return {
                'success': False,
                'message': f'n8n webhook returned error status {response.status_code}',
                'error': f'HTTP {response.status_code}: {error_text}',
                'user_id': user_id,
                'status_code': response.status_code
            }
            
    except requests.exceptions.Timeout:
        return {
            'success': False,
            'message': 'Webhook request timed out',
            'error': 'The n8n webhook did not respond within 30 seconds. The workflow may still be processing.',
            'user_id': user_id
        }
    except requests.exceptions.ConnectionError as e:
        return {
            'success': False,
            'message': 'Failed to connect to n8n webhook',
            'error': f'Cannot connect to n8n webhook at {webhook_url}. Check that n8n is running and the URL is correct. Error: {str(e)}',
            'user_id': user_id
        }
    except Exception as e:
        # Catch any other unexpected errors
        return {
            'success': False,
            'message': 'Unexpected error while calling webhook',
            'error': f'An unexpected error occurred: {str(e)}',
            'user_id': user_id
        }


# Future extensibility example:
# To add more automation triggers, create similar functions following this pattern:
#
# def trigger_weekly_report(user_id: str, meta: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
#     """Trigger the Weekly Report workflow in n8n."""
#     webhook_url = os.getenv('N8N_WEBHOOK_URL_WEEKLY_REPORT', '').strip()
#     # ... similar implementation
#
# def trigger_custom_workflow(user_id: str, workflow_name: str, webhook_url: str, meta: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
#     """Generic function to trigger any n8n workflow by webhook URL."""
#     # ... generic implementation for any workflow

