// Execution history API endpoint
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

        // Get query parameters
        const { searchParams } = new URL(request.url)
        const range = searchParams.get('range') || '7d'

        // Calculate date range
        const now = new Date()
        const daysBack = range === '24h' ? 1 :
            range === '7d' ? 7 :
                range === '30d' ? 30 : 90

        const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000))

        // Get workflow runs for the date range
        const runs = await db.getWorkflowRuns(user.id, 1000) // Get more data for aggregation

        // Filter by date range
        const filteredRuns = runs.filter(run =>
            new Date(run.created_at) >= startDate
        )

        // Group by date and aggregate
        const dailyStats = {}

        filteredRuns.forEach(run => {
            const date = new Date(run.created_at).toISOString().split('T')[0]

            if (!dailyStats[date]) {
                dailyStats[date] = {
                    date,
                    successful: 0,
                    failed: 0,
                    total: 0
                }
            }

            dailyStats[date].total++
            if (run.status === 'completed') {
                dailyStats[date].successful++
            } else if (run.status === 'failed') {
                dailyStats[date].failed++
            }
        })

        // Convert to array and sort by date
        const history = Object.values(dailyStats).sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        )

        return NextResponse.json({ history })

    } catch (error) {
        console.error('Execution history error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch execution history' },
            { status: 500 }
        )
    }
}
