// Workflow runs API endpoint
import { NextResponse } from 'next/server'
import { auth } from '../../../lib/auth'
import { db } from '../../../lib/supabase'

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
        const limit = parseInt(searchParams.get('limit')) || 50
        const workflowId = searchParams.get('workflow_id')

        // Get user's workflow runs
        let runs = await db.getWorkflowRuns(user.id, limit)

        // Filter by workflow if specified
        if (workflowId) {
            runs = runs.filter(run => run.workflow_id === workflowId)
        }

        return NextResponse.json({ runs })

    } catch (error) {
        console.error('Workflow runs error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch workflow runs' },
            { status: 500 }
        )
    }
}

export async function POST(request) {
    try {
        // Check authentication
        const user = await auth.getCurrentUser()
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const runData = await request.json()

        // Validate required fields
        if (!runData.workflow_id) {
            return NextResponse.json(
                { error: 'workflow_id is required' },
                { status: 400 }
            )
        }

        // Create new workflow run
        const run = await db.createWorkflowRun(runData.workflow_id, user.id, runData)

        return NextResponse.json({ run })

    } catch (error) {
        console.error('Create workflow run error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create workflow run' },
            { status: 500 }
        )
    }
}
