// Workflows API endpoint
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

        // Get user's workflows
        const workflows = await db.getWorkflows(user.id)

        return NextResponse.json({ workflows })

    } catch (error) {
        console.error('Workflows error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch workflows' },
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

        const workflowData = await request.json()

        // Validate required fields
        if (!workflowData.name || !workflowData.trigger_type) {
            return NextResponse.json(
                { error: 'Name and trigger_type are required' },
                { status: 400 }
            )
        }

        // Create new workflow
        const workflow = await db.createWorkflow(user.id, workflowData)

        return NextResponse.json({ workflow })

    } catch (error) {
        console.error('Create workflow error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create workflow' },
            { status: 500 }
        )
    }
}
