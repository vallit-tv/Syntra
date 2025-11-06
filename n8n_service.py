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
        
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/workflows",
                headers=self._get_headers(),
                timeout=10
            )
            if response.status_code == 200:
                return True, None
            elif response.status_code == 401:
                return False, "Invalid API key"
            else:
                return False, f"Connection failed: HTTP {response.status_code}"
        except requests.exceptions.Timeout:
            return False, "Connection timeout. Check if n8n is running and accessible."
        except requests.exceptions.ConnectionError:
            return False, "Cannot connect to n8n. Check the URL and ensure n8n is running."
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

