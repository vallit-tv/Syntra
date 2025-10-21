// Workflow execution API endpoint
import { NextResponse } from 'next/server'
import { auth } from '../../../../lib/auth'
import { executeWorkflow } from '../../../../lib/workflow/executor'

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

        const { workflowId, inputData = {} } = await request.json()

        if (!workflowId) {
            return NextResponse.json(
                { error: 'workflowId is required' },
                { status: 400 }
            )
        }

        // Execute workflow
        const result = await executeWorkflow(workflowId, user.id, inputData)

        return NextResponse.json({
            success: true,
            result
        })

    } catch (error) {
        console.error('Workflow execution error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to execute workflow' },
            { status: 500 }
        )
    }
}
