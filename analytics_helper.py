"""
Analytics Helper Module
Provides data aggregation functions for analytics dashboards
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import db

logger = logging.getLogger(__name__)


def get_execution_stats(company_id: Optional[str] = None, user_id: Optional[str] = None, days: int = 30) -> Dict:
    """
    Get execution statistics for a given scope
    
    Args:
        company_id: Filter by company (None for all)
        user_id: Filter by user (None for all)
        days: Number of days to look back (default: 30)
    
    Returns:
        Dict with execution statistics
    """
    try:
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Get all workflow executions in date range
        executions = db.get_all_workflow_executions(limit=10000)  # Large limit to get all
        
        # Filter by date range
        executions = [
            e for e in executions
            if e.get('started_at') and 
            start_date <= datetime.fromisoformat(e['started_at'].replace('Z', '+00:00')) <= end_date
        ]
        
        # Filter by company_id if provided
        if company_id:
            # Get workflow activations for this company
            company_activations = db.get_company_activations(company_id)
            activation_ids = {a['id'] for a in company_activations}
            executions = [
                e for e in executions
                if e.get('workflow_activation_id') in activation_ids
            ]
        
        # Filter by user_id if provided
        elif user_id:
            # Get user's workflow activations
            user_activations = db.get_user_workflow_activations(user_id)
            activation_ids = {a['id'] for a in user_activations}
            executions = [
                e for e in executions
                if e.get('workflow_activation_id') in activation_ids
            ]
        
        # Calculate statistics
        total_executions = len(executions)
        successful = len([e for e in executions if e.get('status') == 'success'])
        failed = len([e for e in executions if e.get('status') == 'failed'])
        
        success_rate = (successful / total_executions * 100) if total_executions > 0 else 0
        
        # Calculate average duration
        durations = [e.get('duration_ms', 0) for e in executions if e.get('duration_ms')]
        avg_duration = sum(durations) / len(durations) if durations else 0
        
        return {
            'total_executions': total_executions,
            'successful': successful,
            'failed': failed,
            'success_rate': round(success_rate, 1),
            'avg_duration_ms': round(avg_duration, 0),
            'date_range': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat(),
                'days': days
            }
        }
    except Exception as e:
        logger.error(f"Error getting execution stats: {e}")
        return {
            'total_executions': 0,
            'successful': 0,
            'failed': 0,
            'success_rate': 0,
            'avg_duration_ms': 0,
            'error': str(e)
        }


def get_workflow_performance(workflow_id: str, company_id: Optional[str] = None, days: int = 30) -> Dict:
    """
    Get performance metrics for a specific workflow
    
    Args:
        workflow_id: Workflow ID
        company_id: Filter by company (optional)
        days: Number of days to look back
    
    Returns:
        Dict with workflow performance metrics
    """
    try:
        # Get workflow details
        workflow = db.get_workflow_by_id(workflow_id)
        if not workflow:
            return {'error': 'Workflow not found'}
        
        # Get executions for this workflow
        executions = db.get_all_workflow_executions(workflow_id=workflow_id, limit=1000)
        
        # Filter by date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        executions = [
            e for e in executions
            if e.get('started_at') and
            start_date <= datetime.fromisoformat(e['started_at'].replace('Z', '+00:00')) <= end_date
        ]
        
        # Calculate metrics
        total_runs = len(executions)
        successful_runs = len([e for e in executions if e.get('status') == 'success'])
        failed_runs = len([e for e in executions if e.get('status') == 'failed'])
        
        success_rate = (successful_runs / total_runs * 100) if total_runs > 0 else 0
        
        # Duration statistics
        durations = [e.get('duration_ms', 0) for e in executions if e.get('duration_ms')]
        avg_duration = sum(durations) / len(durations) if durations else 0
        min_duration = min(durations) if durations else 0
        max_duration = max(durations) if durations else 0
        
        # Get most recent execution
        most_recent = executions[0] if executions else None
        
        return {
            'workflow': {
                'id': workflow['id'],
                'name': workflow['name'],
                'is_active': workflow.get('is_active', False)
            },
            'total_runs': total_runs,
            'successful_runs': successful_runs,
            'failed_runs': failed_runs,
            'success_rate': round(success_rate, 1),
            'duration': {
                'avg_ms': round(avg_duration, 0),
                'min_ms': min_duration,
                'max_ms': max_duration
            },
            'most_recent_execution': most_recent.get('started_at') if most_recent else None,
            'date_range': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat(),
                'days': days
            }
        }
    except Exception as e:
        logger.error(f"Error getting workflow performance: {e}")
        return {'error': str(e)}


def get_timeline_data(start_date: datetime, end_date: datetime, company_id: Optional[str] = None, user_id: Optional[str] = None) -> List[Dict]:
    """
    Get execution timeline data for charting
    
    Args:
        start_date: Start date
        end_date: End date
        company_id: Filter by company (optional)
        user_id: Filter by user (optional)
    
    Returns:
        List of daily execution counts
    """
    try:
        # Get all executions
        executions = db.get_all_workflow_executions(limit=10000)
        
        # Filter by date range
        executions = [
            e for e in executions
            if e.get('started_at') and
            start_date <= datetime.fromisoformat(e['started_at'].replace('Z', '+00:00')) <= end_date
        ]
        
        # Filter by scope
        if company_id:
            company_activations = db.get_company_activations(company_id)
            activation_ids = {a['id'] for a in company_activations}
            executions = [e for e in executions if e.get('workflow_activation_id') in activation_ids]
        elif user_id:
            user_activations = db.get_user_workflow_activations(user_id)
            activation_ids = {a['id'] for a in user_activations}
            executions = [e for e in executions if e.get('workflow_activation_id') in activation_ids]
        
        # Group by date
        daily_counts = {}
        current_date = start_date.date()
        end = end_date.date()
        
        while current_date <= end:
            daily_counts[current_date.isoformat()] = {'success': 0, 'failed': 0, 'total': 0}
            current_date += timedelta(days=1)
        
        # Count executions per day
        for execution in executions:
            if execution.get('started_at'):
                exec_date = datetime.fromisoformat(execution['started_at'].replace('Z', '+00:00')).date()
                date_str = exec_date.isoformat()
                
                if date_str in daily_counts:
                    daily_counts[date_str]['total'] += 1
                    if execution.get('status') == 'success':
                        daily_counts[date_str]['success'] += 1
                    elif execution.get('status') == 'failed':
                        daily_counts[date_str]['failed'] += 1
        
        # Convert to list format
        timeline = [
            {
                'date': date,
                'success': counts['success'],
                'failed': counts['failed'],
                'total': counts['total']
            }
            for date, counts in sorted(daily_counts.items())
        ]
        
        return timeline
    except Exception as e:
        logger.error(f"Error getting timeline data: {e}")
        return []


def get_top_workflows(company_id: Optional[str] = None, user_id: Optional[str] = None, limit: int = 10, days: int = 30) -> List[Dict]:
    """
    Get top workflows by execution count
    
    Args:
        company_id: Filter by company (optional)
        user_id: Filter by user (optional)
        limit: Number of workflows to return
        days: Number of days to look back
    
    Returns:
        List of workflows with execution counts
    """
    try:
        # Get executions
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        executions = db.get_all_workflow_executions(limit=10000)
        executions = [
            e for e in executions
            if e.get('started_at') and
            start_date <= datetime.fromisoformat(e['started_at'].replace('Z', '+00:00')) <= end_date
        ]
        
        # Filter by scope
        if company_id:
            company_activations = db.get_company_activations(company_id)
            activation_ids = {a['id'] for a in company_activations}
            executions = [e for e in executions if e.get('workflow_activation_id') in activation_ids]
        elif user_id:
            user_activations = db.get_user_workflow_activations(user_id)
            activation_ids = {a['id'] for a in user_activations}
            executions = [e for e in executions if e.get('workflow_activation_id') in activation_ids]
        
        # Count by workflow
        workflow_counts = {}
        for execution in executions:
            workflow_id = execution.get('workflow_id')
            if workflow_id:
                if workflow_id not in workflow_counts:
                    workflow_counts[workflow_id] = {
                        'total': 0,
                        'success': 0,
                        'failed': 0
                    }
                workflow_counts[workflow_id]['total'] += 1
                if execution.get('status') == 'success':
                    workflow_counts[workflow_id]['success'] += 1
                elif execution.get('status') == 'failed':
                    workflow_counts[workflow_id]['failed'] += 1
        
        # Get workflow details and sort
        top_workflows = []
        for workflow_id, counts in workflow_counts.items():
            workflow = db.get_workflow_by_id(workflow_id)
            if workflow:
                top_workflows.append({
                    'workflow': {
                        'id': workflow['id'],
                        'name': workflow['name']
                    },
                    'executions': counts['total'],
                    'success': counts['success'],
                    'failed': counts['failed'],
                    'success_rate': round((counts['success'] / counts['total'] * 100), 1) if counts['total'] > 0 else 0
                })
        
        # Sort by execution count and return top N
        top_workflows.sort(key=lambda x: x['executions'], reverse=True)
        return top_workflows[:limit]
        
    except Exception as e:
        logger.error(f"Error getting top workflows: {e}")
        return []


def get_system_overview() -> Dict:
    """
    Get system-wide overview statistics (admin only)
    
    Returns:
        Dict with system overview data
    """
    try:
        # Get counts
        all_users = db.get_all_users()
        all_companies = db.get_companies()
        all_workflows = db.get_all_workflows()
        
        # Get execution stats for last 30 days
        exec_stats = get_execution_stats(days=30)
        
        return {
            'total_users': len(all_users),
            'total_companies': len(all_companies),
            'total_workflows': len(all_workflows),
            'active_workflows': len([w for w in all_workflows if w.get('is_active')]),
            'executions_30d': exec_stats['total_executions'],
            'success_rate': exec_stats['success_rate'],
            'avg_duration_ms': exec_stats['avg_duration_ms']
        }
    except Exception as e:
        logger.error(f"Error getting system overview: {e}")
        return {
            'total_users': 0,
            'total_companies': 0,
            'total_workflows': 0,
            'active_workflows': 0,
            'executions_30d': 0,
            'success_rate': 0,
            'avg_duration_ms': 0,
            'error': str(e)
        }


# Testing
if __name__ == '__main__':
    print("Analytics Helper Test")
    print("=" * 50)
    
    print("\nSystem Overview:")
    overview = get_system_overview()
    for key, value in overview.items():
        print(f"  {key}: {value}")
    
    print("\nExecution Stats (30 days):")
    stats = get_execution_stats(days=30)
    for key, value in stats.items():
        print(f"  {key}: {value}")

