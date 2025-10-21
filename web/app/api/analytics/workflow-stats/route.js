// Workflow statistics API endpoint
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

        // Get user's workflows with stats
        const workflows = await db.getWorkflows(user.id)

        // Get stats for each workflow
        const stats = await Promise.all(
            workflows.map(async (workflow) => {
                const workflowStats = await db.getWorkflowStats(workflow.id)
                return {
                    id: workflow.id,
                    name: workflow.name,
                    description: workflow.description,
                    status: workflow.status,
                    ...workflowStats
                }
            })
        )

        return NextResponse.json({ stats })

    } catch (error) {
        console.error('Workflow stats error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch workflow stats' },
            { status: 500 }
        )
    }
}
