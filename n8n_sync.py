"""
N8N Workflow Synchronization Module
Handles automatic sync of workflows from n8n instance to Syntra database
"""

import os
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import json

try:
    from apscheduler.schedulers.background import BackgroundScheduler
    from apscheduler.triggers.interval import IntervalTrigger
    SCHEDULER_AVAILABLE = True
except ImportError:
    SCHEDULER_AVAILABLE = False
    logging.warning("APScheduler not installed. Auto-sync will not be available.")

import db
from n8n_service import N8nService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global scheduler instance
_scheduler = None
_last_sync_time = None
_sync_stats = {
    'last_run': None,
    'workflows_added': 0,
    'workflows_updated': 0,
    'workflows_removed': 0,
    'last_error': None
}


def get_sync_stats() -> Dict:
    """Get current synchronization statistics"""
    return {
        **_sync_stats,
        'next_run': get_next_sync_time(),
        'scheduler_running': is_scheduler_running()
    }


def sync_workflows_from_n8n() -> Dict:
    """
    Sync workflows from n8n to database.
    
    Returns:
        Dict with sync statistics: {
            'success': bool,
            'added': int,
            'updated': int,
            'removed': int,
            'total': int,
            'error': Optional[str]
        }
    """
    global _last_sync_time, _sync_stats
    
    logger.info("Starting workflow sync from n8n...")
    
    try:
        # Initialize n8n service using the getter function
        from n8n_service import get_n8n_service
        n8n_service = get_n8n_service()
        
        if not n8n_service.is_configured():
            error_msg = "n8n not configured. Set N8N_API_KEY environment variable. N8N_URL is optional (defaults to https://app.n8n.cloud)."
            logger.error(error_msg)
            _sync_stats['last_error'] = error_msg
            _sync_stats['last_run'] = datetime.now().isoformat()
            return {
                'success': False,
                'added': 0,
                'updated': 0,
                'removed': 0,
                'total': 0,
                'error': error_msg
            }
        
        # Check n8n connection
        connected, message = n8n_service.test_connection()
        if not connected:
            error_msg = "Failed to connect to n8n. Check N8N_API_KEY and optionally N8N_URL."
            logger.error(error_msg)
            _sync_stats['last_error'] = error_msg
            _sync_stats['last_run'] = datetime.now().isoformat()
            return {
                'success': False,
                'added': 0,
                'updated': 0,
                'removed': 0,
                'total': 0,
                'error': error_msg
            }
        
        # Fetch workflows from n8n
        n8n_workflows = n8n_service.get_workflows()
        if not n8n_workflows:
            logger.warning("No workflows found in n8n")
            n8n_workflows = []
        
        # Get existing workflows from database
        db_workflows = db.get_all_workflows()
        db_workflows_map = {w['n8n_workflow_id']: w for w in db_workflows if w.get('n8n_workflow_id')}
        
        # Track sync statistics
        added = 0
        updated = 0
        removed = 0
        
        # Create set of n8n workflow IDs for tracking
        n8n_workflow_ids = set()
        
        # Sync workflows from n8n
        for n8n_workflow in n8n_workflows:
            n8n_id = n8n_workflow.get('id')
            if not n8n_id:
                continue
            
            n8n_workflow_ids.add(str(n8n_id))
            
            # Prepare workflow data
            workflow_data = {
                'name': n8n_workflow.get('name', f'Workflow {n8n_id}'),
                'description': n8n_workflow.get('description', ''),
                'n8n_workflow_id': str(n8n_id),
                'is_active': n8n_workflow.get('active', False),
                'is_public': True,  # Default to public for admin management
                'config': {
                    'tags': n8n_workflow.get('tags', []),
                    'nodes': n8n_workflow.get('nodes', []),
                    'connections': n8n_workflow.get('connections', {}),
                    'settings': n8n_workflow.get('settings', {})
                }
            }
            
            # Check if workflow exists in database
            if str(n8n_id) in db_workflows_map:
                # Update existing workflow
                db_workflow = db_workflows_map[str(n8n_id)]
                try:
                    db.update_workflow(db_workflow['id'], workflow_data)
                    updated += 1
                    logger.info(f"Updated workflow: {workflow_data['name']}")
                except Exception as e:
                    logger.error(f"Failed to update workflow {n8n_id}: {e}")
            else:
                # Create new workflow
                try:
                    db.create_workflow(workflow_data)
                    added += 1
                    logger.info(f"Added workflow: {workflow_data['name']}")
                except Exception as e:
                    logger.error(f"Failed to create workflow {n8n_id}: {e}")
        
        # Mark workflows as inactive if they no longer exist in n8n
        for db_workflow in db_workflows:
            if db_workflow.get('n8n_workflow_id') and \
               db_workflow['n8n_workflow_id'] not in n8n_workflow_ids:
                try:
                    db.update_workflow(db_workflow['id'], {'is_active': False})
                    removed += 1
                    logger.info(f"Marked workflow as inactive: {db_workflow['name']}")
                except Exception as e:
                    logger.error(f"Failed to mark workflow {db_workflow['id']} as inactive: {e}")
        
        # Update sync stats
        _last_sync_time = datetime.now()
        _sync_stats.update({
            'last_run': _last_sync_time.isoformat(),
            'workflows_added': added,
            'workflows_updated': updated,
            'workflows_removed': removed,
            'last_error': None
        })
        
        logger.info(f"Sync complete: {added} added, {updated} updated, {removed} removed")
        
        return {
            'success': True,
            'added': added,
            'updated': updated,
            'removed': removed,
            'total': len(n8n_workflows),
            'error': None
        }
        
    except Exception as e:
        error_msg = f"Sync failed: {str(e)}"
        logger.error(error_msg, exc_info=True)
        _sync_stats['last_error'] = error_msg
        _sync_stats['last_run'] = datetime.now().isoformat()
        return {
            'success': False,
            'added': 0,
            'updated': 0,
            'removed': 0,
            'total': 0,
            'error': error_msg
        }


def start_auto_sync(interval_minutes: int = 1):
    """
    Start automatic workflow synchronization
    
    Args:
        interval_minutes: Sync interval in minutes (default: 30)
    """
    global _scheduler
    
    if not SCHEDULER_AVAILABLE:
        logger.error("APScheduler not installed. Cannot start auto-sync.")
        return False
    
    if _scheduler and _scheduler.running:
        logger.warning("Scheduler already running")
        return True
    
    try:
        _scheduler = BackgroundScheduler(daemon=True)
        _scheduler.add_job(
            func=sync_workflows_from_n8n,
            trigger=IntervalTrigger(minutes=interval_minutes),
            id='n8n_workflow_sync',
            name='N8N Workflow Sync',
            replace_existing=True,
            max_instances=1  # Prevent overlapping syncs
        )
        _scheduler.start()
        logger.info(f"Auto-sync started (interval: {interval_minutes} minute{'s' if interval_minutes != 1 else ''})")
        return True
    except Exception as e:
        logger.error(f"Failed to start auto-sync: {e}")
        return False


def stop_auto_sync():
    """Stop automatic workflow synchronization"""
    global _scheduler
    
    if _scheduler and _scheduler.running:
        _scheduler.shutdown()
        _scheduler = None
        logger.info("Auto-sync stopped")
        return True
    else:
        logger.warning("Scheduler not running")
        return False


def is_scheduler_running() -> bool:
    """Check if auto-sync scheduler is running"""
    return _scheduler is not None and _scheduler.running


def get_next_sync_time() -> Optional[str]:
    """Get next scheduled sync time"""
    if not _scheduler or not _scheduler.running:
        return None
    
    job = _scheduler.get_job('n8n_workflow_sync')
    if job and job.next_run_time:
        return job.next_run_time.isoformat()
    return None


def force_sync_now() -> Dict:
    """
    Force an immediate sync (bypasses scheduler)
    
    Returns:
        Sync results dictionary
    """
    logger.info("Forcing immediate sync...")
    return sync_workflows_from_n8n()


# Module initialization
if __name__ == '__main__':
    # Manual testing
    import sys
    
    print("N8N Workflow Sync Tool")
    print("=" * 50)
    
    if len(sys.argv) > 1 and sys.argv[1] == '--auto':
        print("Starting auto-sync mode...")
        start_auto_sync(interval_minutes=30)
        print("Auto-sync started. Press Ctrl+C to stop.")
        try:
            import time
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\nStopping auto-sync...")
            stop_auto_sync()
            print("Stopped.")
    else:
        print("Running manual sync...")
        result = sync_workflows_from_n8n()
        print("\nSync Results:")
        print(f"  Success: {result['success']}")
        print(f"  Added: {result['added']}")
        print(f"  Updated: {result['updated']}")
        print(f"  Removed: {result['removed']}")
        print(f"  Total: {result['total']}")
        if result.get('error'):
            print(f"  Error: {result['error']}")
        print("\nTo enable auto-sync, run with --auto flag")

