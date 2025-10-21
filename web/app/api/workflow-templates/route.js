// Workflow templates API endpoint
import { NextResponse } from 'next/server'
import { auth } from '../../../lib/auth'
import workflowTemplates from '../../../data/workflow-templates.json'

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
        const category = searchParams.get('category')

        let templates = workflowTemplates.templates

        // Filter by category if specified
        if (category) {
            templates = templates.filter(template => template.category === category)
        }

        return NextResponse.json({ templates })

    } catch (error) {
        console.error('Workflow templates error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch workflow templates' },
            { status: 500 }
        )
    }
}
