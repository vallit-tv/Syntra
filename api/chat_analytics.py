"""
Chat Analytics Service - Track and aggregate chat statistics per company

This service tracks:
- Messages sent per company
- Sessions created per company
- Tokens consumed per company
- Average response times

Statistics are aggregated daily for efficient querying.
"""

from datetime import datetime, date, timedelta, timezone
from typing import Optional, Dict, List, Any
import db


def track_message(company_id: Optional[str], tokens_used: Optional[int] = 0, 
                 response_time_ms: Optional[int] = None) -> None:
    """
    Track a chat message and update daily statistics.
    
    Args:
        company_id: Company UUID (None for non-company sessions)
        tokens_used: Number of AI tokens consumed
        response_time_ms: Response time in milliseconds
    """
    if not company_id:
        return  # Skip tracking if no company
    
    try:
        db_client = db.get_db()
        if not db_client:
            print("Database not available for chat analytics")
            return
        
        today = date.today()
        
        # Upsert daily statistics
        # PostgreSQL doesn't have native UPSERT in basic queries, use ON CONFLICT
        result = db_client.table('chat_statistics').select('*').eq(
            'company_id', company_id
        ).eq('date', str(today)).execute()
        
        if result.data and len(result.data) > 0:
            # Update existing record
            stats = result.data[0]
            new_total_messages = stats['total_messages'] + 1
            new_total_tokens = stats['total_tokens'] + (tokens_used or 0)
            
            # Calculate running average response time
            if response_time_ms and stats['avg_response_time_ms']:
                old_avg = stats['avg_response_time_ms']
                old_count = stats['total_messages']
                new_avg = ((old_avg * old_count) + response_time_ms) / new_total_messages
            elif response_time_ms:
                new_avg = response_time_ms
            else:
                new_avg = stats['avg_response_time_ms']
            
            db_client.table('chat_statistics').update({
                'total_messages': new_total_messages,
                'total_tokens': new_total_tokens,
                'avg_response_time_ms': int(new_avg) if new_avg else None,
                'updated_at': datetime.now(timezone.utc).isoformat()
            }).eq('id', stats['id']).execute()
        else:
            # Insert new record
            db_client.table('chat_statistics').insert({
                'company_id': company_id,
                'date': str(today),
                'total_messages': 1,
                'total_sessions': 0,  # Updated separately
                'total_tokens': tokens_used or 0,
                'avg_response_time_ms': response_time_ms
            }).execute()
            
    except Exception as e:
        print(f"Error tracking message stats: {e}")


def track_session(company_id: Optional[str]) -> None:
    """
    Increment session count for a company.
    
    Args:
        company_id: Company UUID
    """
    if not company_id:
        return
    
    try:
        db_client = db.get_db()
        if not db_client:
            return
        
        today = date.today()
        
        result = db_client.table('chat_statistics').select('*').eq(
            'company_id', company_id
        ).eq('date', str(today)).execute()
        
        if result.data and len(result.data) > 0:
            stats = result.data[0]
            db_client.table('chat_statistics').update({
                'total_sessions': stats['total_sessions'] + 1,
                'updated_at': datetime.now(timezone.utc).isoformat()
            }).eq('id', stats['id']).execute()
        else:
            # Create initial record
            db_client.table('chat_statistics').insert({
                'company_id': company_id,
                'date': str(today),
                'total_messages': 0,
                'total_sessions': 1,
                'total_tokens': 0
            }).execute()
            
    except Exception as e:
        print(f"Error tracking session: {e}")


def get_company_stats(company_id: str, days: int = 30) -> Dict[str, Any]:
    """
    Get aggregated statistics for a company.
    
    Args:
        company_id: Company UUID
        days: Number of days to include
        
    Returns:
        Dictionary with totals and daily breakdown
    """
    try:
        db_client = db.get_db()
        if not db_client:
            return {'error': 'Database not available'}
        
        start_date = date.today() - timedelta(days=days)
        
        result = db_client.table('chat_statistics').select('*').eq(
            'company_id', company_id
        ).gte('date', str(start_date)).order('date', desc=False).execute()
        
        daily_stats = result.data if result.data else []
        
        # Calculate totals
        total_messages = sum(s['total_messages'] for s in daily_stats)
        total_sessions = sum(s['total_sessions'] for s in daily_stats)
        total_tokens = sum(s['total_tokens'] for s in daily_stats)
        
        # Average response time (weighted by message count)
        total_time = sum(
            s['total_messages'] * (s['avg_response_time_ms'] or 0) 
            for s in daily_stats
        )
        avg_response_time = total_time / total_messages if total_messages > 0 else None
        
        return {
            'period_days': days,
            'total_messages': total_messages,
            'total_sessions': total_sessions,
            'total_tokens': total_tokens,
            'avg_response_time_ms': int(avg_response_time) if avg_response_time else None,
            'daily_breakdown': daily_stats
        }
        
    except Exception as e:
        print(f"Error getting company stats: {e}")
        return {'error': str(e)}


def get_all_companies_summary() -> List[Dict[str, Any]]:
    """
    Get summary statistics for all companies (last 30 days).
    
    Returns:
        List of company summaries with key metrics
    """
    try:
        db_client = db.get_db()
        if not db_client:
            return []
        
        # Get all companies
        companies_result = db_client.table('companies').select('id,name').execute()
        if not companies_result.data:
            return []
        
        companies = companies_result.data
        summaries = []
        
        start_date = date.today() - timedelta(days=30)
        
        for company in companies:
            company_id = company['id']
            
            # Get stats for this company
            stats_result = db_client.table('chat_statistics').select('*').eq(
                'company_id', company_id
            ).gte('date', str(start_date)).execute()
            
            stats = stats_result.data if stats_result.data else []
            
            total_messages = sum(s['total_messages'] for s in stats)
            total_sessions = sum(s['total_sessions'] for s in stats)
            total_tokens = sum(s['total_tokens'] for s in stats)
            
            summaries.append({
                'company_id': company_id,
                'company_name': company['name'],
                'total_messages': total_messages,
                'total_sessions': total_sessions,
                'total_tokens': total_tokens,
                'has_activity': total_messages > 0
            })
        
        # Sort by activity (most active first)
        summaries.sort(key=lambda x: x['total_messages'], reverse=True)
        
        return summaries
        
    except Exception as e:
        print(f"Error getting companies summary: {e}")
        return []


def get_today_stats(company_id: str) -> Dict[str, Any]:
    """
    Get today's statistics for a company.
    
    Args:
        company_id: Company UUID
        
    Returns:
        Today's stats or empty dict
    """
    try:
        db_client = db.get_db()
        if not db_client:
            return {}
        
        today = date.today()
        
        result = db_client.table('chat_statistics').select('*').eq(
            'company_id', company_id
        ).eq('date', str(today)).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        return {
            'total_messages': 0,
            'total_sessions': 0,
            'total_tokens': 0,
            'avg_response_time_ms': None
        }
        
    except Exception as e:
        print(f"Error getting today stats: {e}")
        return {}
