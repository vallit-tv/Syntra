// AI Chat API endpoint
import { NextResponse } from 'next/server'
import { auth } from '../../../../lib/auth'
import { ai } from '../../../../lib/openai'
import { db } from '../../../../lib/supabase'

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

        const { message, context = {} } = await request.json()

        if (!message || message.trim().length === 0) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            )
        }

        // Get user context for better responses
        const userProfile = await db.getUserProfile(user.id)
        const userWorkflows = await db.getWorkflows(user.id)

        const enhancedContext = {
            ...context,
            user: {
                name: userProfile?.full_name,
                company: userProfile?.company,
                subscriptionTier: userProfile?.subscription_tier
            },
            workflows: userWorkflows?.length || 0,
            recentActivity: await db.getWorkflowRuns(user.id, 5)
        }

        // Track chat event
        await db.trackEvent(user.id, 'ai_chat_message', {
            messageLength: message.length,
            hasContext: Object.keys(context).length > 0
        })

        // Get AI response
        const response = await ai.chat(message, enhancedContext)

        // Track successful chat
        await db.trackEvent(user.id, 'ai_chat_response', {
            responseLength: response.length
        })

        return NextResponse.json({
            success: true,
            response,
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('Chat error:', error)

        // Track failed chat
        if (user) {
            await db.trackEvent(user.id, 'ai_chat_failed', {
                error: error.message
            })
        }

        return NextResponse.json(
            { error: error.message || 'Failed to process chat message' },
            { status: 500 }
        )
    }
}
