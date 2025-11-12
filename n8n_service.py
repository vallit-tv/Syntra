"""n8n API Service - System-wide connection via environment variables"""
import os
import requests
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

class N8nService:
    """Centralized service for interacting with n8n API"""
    
    def __init__(self):
        self.base_url = os.getenv('N8N_URL', '').rstrip('/')
        self.api_key = os.getenv('N8N_API_KEY', '')
    
    def is_configured(self) -> bool:
        """Check if n8n is properly configured"""
        return bool(self.base_url and self.api_key)
    
    def _get_headers(self) -> Dict[str, str]:
        """Get headers for n8n API requests"""
        return {
            'X-N8N-API-KEY': self.api_key,
            'Content-Type': 'application/json'
        }
    
    def test_connection(self) -> tuple:
        """Test connection to n8n instance"""
        if not self.is_configured():
            return False, "n8n not configured. Set N8N_URL and N8N_API_KEY environment variables."
        
        # Check if URL is still the placeholder
        if 'your-ngrok-url' in self.base_url or 'your-n8n-url' in self.base_url.lower():
            return False, "N8N_URL is still set to placeholder. Update your .env file with the actual ngrok URL from ./start-n8n-ngrok.sh"
        
        try:
            # First try the health endpoint (simpler, doesn't require auth)
            try:
                health_response = requests.get(
                    f"{self.base_url}/healthz",
                    timeout=5,
                    allow_redirects=False
                )
                # If health check works, n8n is reachable
            except:
                pass  # Continue to API check
            
            # Now test the actual API endpoint
            response = requests.get(
                f"{self.base_url}/api/v1/workflows",
                headers=self._get_headers(),
                timeout=10,
                allow_redirects=False
            )
            
            if response.status_code == 200:
                return True, None
            elif response.status_code == 401:
                return False, "Invalid API key. Check N8N_API_KEY in your .env file."
            elif response.status_code == 404:
                # Check if it's ngrok warning page
                if 'ngrok' in response.text.lower() or 'trycloudflare' in response.text.lower():
                    return False, "ngrok/Cloudflare warning page detected. Visit the URL in a browser first to bypass the warning, then try again."
                return False, f"Connection failed: HTTP 404. Check that n8n is running and the URL is correct. Current URL: {self.base_url}"
            else:
                return False, f"Connection failed: HTTP {response.status_code}"
        except requests.exceptions.Timeout:
            return False, "Connection timeout. Check if n8n is running and accessible."
        except requests.exceptions.ConnectionError as e:
            error_msg = str(e)
            if 'Name or service not known' in error_msg or 'nodename nor servname provided' in error_msg:
                return False, f"Cannot resolve hostname. Check that N8N_URL is correct: {self.base_url}"
            return False, f"Cannot connect to n8n: {error_msg}. Check the URL and ensure n8n is running."
        except Exception as e:
            return False, f"Connection error: {str(e)}"
    
    def get_workflows(self) -> List[Dict]:
        """Fetch all workflows from n8n"""
        if not self.is_configured():
            return []
        
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/workflows",
                headers=self._get_headers(),
                timeout=30
            )
            if response.status_code == 200:
                return response.json() or []
            else:
                print(f"Error fetching workflows: HTTP {response.status_code}")
                return []
        except Exception as e:
            print(f"Error fetching workflows: {e}")
            return []
    
    def get_workflow(self, workflow_id: int) -> Optional[Dict]:
        """Get specific workflow from n8n by ID"""
        if not self.is_configured():
            return None
        
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/workflows/{workflow_id}",
                headers=self._get_headers(),
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Error fetching workflow {workflow_id}: HTTP {response.status_code}")
                return None
        except Exception as e:
            print(f"Error fetching workflow {workflow_id}: {e}")
            return None
    
    def execute_workflow(self, workflow_id: int, data: Optional[Dict] = None) -> Optional[Dict]:
        """Execute a workflow via n8n API"""
        if not self.is_configured():
            return None
        
        try:
            payload = data or {}
            response = requests.post(
                f"{self.base_url}/api/v1/workflows/{workflow_id}/execute",
                headers=self._get_headers(),
                json=payload,
                timeout=60
            )
            if response.status_code in [200, 201]:
                return response.json()
            else:
                print(f"Error executing workflow {workflow_id}: HTTP {response.status_code}")
                error_text = response.text
                return {'error': f"HTTP {response.status_code}", 'details': error_text}
        except Exception as e:
            print(f"Error executing workflow {workflow_id}: {e}")
            return {'error': str(e)}
    
    def get_execution(self, execution_id: str) -> Optional[Dict]:
        """Get execution status from n8n"""
        if not self.is_configured():
            return None
        
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/executions/{execution_id}",
                headers=self._get_headers(),
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Error fetching execution {execution_id}: HTTP {response.status_code}")
                return None
        except Exception as e:
            print(f"Error fetching execution {execution_id}: {e}")
            return None
    
    def get_workflow_executions(self, workflow_id: int, limit: int = 50) -> List[Dict]:
        """Get recent executions for a workflow"""
        if not self.is_configured():
            return []
        
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/workflows/{workflow_id}/executions",
                headers=self._get_headers(),
                params={'limit': limit},
                timeout=10
            )
            if response.status_code == 200:
                result = response.json()
                # n8n returns {data: [...], nextCursor: ...}
                if isinstance(result, dict) and 'data' in result:
                    return result['data']
                elif isinstance(result, list):
                    return result
                return []
            else:
                print(f"Error fetching executions for workflow {workflow_id}: HTTP {response.status_code}")
                return []
        except Exception as e:
            print(f"Error fetching executions for workflow {workflow_id}: {e}")
            return []

# Global instance
_n8n_service = None

def get_n8n_service() -> N8nService:
    """Get the global n8n service instance"""
    global _n8n_service
    if _n8n_service is None:
        _n8n_service = N8nService()
    return _n8n_service

