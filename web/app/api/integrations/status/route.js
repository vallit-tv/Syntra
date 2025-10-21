// Integration status endpoint
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

        // Get user's API keys
        const apiKeys = await db.getApiKeys(user.id)

        // Define available integrations
        const availableIntegrations = [
            { type: 'openai', name: 'OpenAI', description: 'AI analysis and chat' },
            { type: 'notion', name: 'Notion', description: 'Page analysis and automation' },
            { type: 'webhook', name: 'Webhooks', description: 'External triggers' },
            { type: 'api_key', name: 'Custom APIs', description: 'Generic API integrations' }
        ]

        // Check status for each integration
        const integrations = availableIntegrations.map(integration => {
            const hasKey = apiKeys.some(key =>
                key.type === integration.type && key.is_active
            )

            return {
                type: integration.type,
                name: integration.name,
                description: integration.description,
                connected: hasKey,
                valid: hasKey // In a real app, you'd validate the key here
            }
        })

        return NextResponse.json({ integrations })

    } catch (error) {
        console.error('Integration status error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch integration status' },
            { status: 500 }
        )
    }
}
