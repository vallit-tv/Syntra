// AI Analysis API endpoint
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

        const { data, context, analysisType = 'general' } = await request.json()

        if (!data) {
            return NextResponse.json(
                { error: 'Data is required for analysis' },
                { status: 400 }
            )
        }

        // Track analytics event
        await db.trackEvent(user.id, 'ai_analysis_requested', {
            analysisType,
            dataSize: JSON.stringify(data).length
        })

        let result

        // Perform analysis based on type
        switch (analysisType) {
            case 'notion_page':
                result = await ai.analyzeNotionPage(data, context)
                break
            case 'workflow_insights':
                result = await ai.generateWorkflowInsights(data, context)
                break
            case 'general':
            default:
                result = await ai.analyzeData(data, context)
                break
        }

        // Track successful analysis
        await db.trackEvent(user.id, 'ai_analysis_completed', {
            analysisType,
            confidence: result.confidence || 0.8
        })

        return NextResponse.json({
            success: true,
            result,
            analysisType,
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('Analysis error:', error)

        // Track failed analysis
        if (user) {
            await db.trackEvent(user.id, 'ai_analysis_failed', {
                error: error.message,
                analysisType: request.body?.analysisType || 'unknown'
            })
        }

        return NextResponse.json(
            { error: error.message || 'Failed to analyze data' },
            { status: 500 }
        )
    }
}
