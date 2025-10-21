// Individual workflow API endpoint
import { NextResponse } from 'next/server'
import { auth } from '../../../../lib/auth'
import { db } from '../../../../lib/supabase'

export async function GET(request, { params }) {
    try {
        // Check authentication
        const user = await auth.getCurrentUser()
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const { id } = params

        // Get specific workflow
        const workflow = await db.getWorkflow(id, user.id)

        if (!workflow) {
            return NextResponse.json(
                { error: 'Workflow not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ workflow })

    } catch (error) {
        console.error('Get workflow error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch workflow' },
            { status: 500 }
        )
    }
}

export async function PUT(request, { params }) {
    try {
        // Check authentication
        const user = await auth.getCurrentUser()
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const { id } = params
        const updates = await request.json()

        // Update workflow
        const workflow = await db.updateWorkflow(id, user.id, updates)

        return NextResponse.json({ workflow })

    } catch (error) {
        console.error('Update workflow error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update workflow' },
            { status: 500 }
        )
    }
}

export async function DELETE(request, { params }) {
    try {
        // Check authentication
        const user = await auth.getCurrentUser()
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const { id } = params

        // Delete workflow
        await db.deleteWorkflow(id, user.id)

        return NextResponse.json({ message: 'Workflow deleted successfully' })

    } catch (error) {
        console.error('Delete workflow error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to delete workflow' },
            { status: 500 }
        )
    }
}
