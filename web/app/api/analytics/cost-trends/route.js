// Cost trends API endpoint
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
        const runs = await db.getWorkflowRuns(user.id, 1000)

        // Filter by date range
        const filteredRuns = runs.filter(run =>
            new Date(run.created_at) >= startDate
        )

        // Group by date and sum costs
        const dailyCosts = {}

        filteredRuns.forEach(run => {
            const date = new Date(run.created_at).toISOString().split('T')[0]
            const cost = parseFloat(run.cost_usd) || 0

            if (!dailyCosts[date]) {
                dailyCosts[date] = {
                    date,
                    cost: 0
                }
            }

            dailyCosts[date].cost += cost
        })

        // Convert to array and sort by date
        const trends = Object.values(dailyCosts).sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        )

        return NextResponse.json({ trends })

    } catch (error) {
        console.error('Cost trends error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch cost trends' },
            { status: 500 }
        )
    }
}
