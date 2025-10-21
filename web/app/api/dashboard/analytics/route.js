// Dashboard analytics API endpoint
import { NextResponse } from 'next/server'
import { auth } from '../../../../lib/auth'
import { db } from '../../../../lib/supabase'

export async function GET(request) {
    try {
        // Check authentication
        const user = await auth.getCurrentUser()
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        // Get analytics summary from database
        const analytics = await db.getAnalyticsSummary(user.id)

        return NextResponse.json(analytics)

    } catch (error) {
        console.error('Analytics error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch analytics' },
            { status: 500 }
        )
    }
}
