// Enhanced Notion webhook API endpoint with AI analysis
import { db } from '../../../lib/supabase'
import { notionClient, notionUtils, webhookUtils } from '../../../lib/notion'
import { ai } from '../../../lib/openai'

export async function POST(request) {
    try {
        // Get the raw body from the request
        const body = await request.text()

        // Get headers from the request
        const signature = request.headers.get('x-notion-signature') || ''
        const timestamp = request.headers.get('x-notion-timestamp') || ''

        // Verify webhook signature
        const signingSecret = process.env.NOTION_SIGNING_SECRET
        if (signingSecret && !webhookUtils.verifySignature(body, signature, signingSecret)) {
            console.error('Invalid webhook signature')
            return new Response(JSON.stringify({ error: 'Invalid signature' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // Parse the webhook payload
        const payload = webhookUtils.parseWebhookPayload(body)

        // Store the event in database
        const eventData = {
            id: `${payload.type}_${payload.pageId}_${Date.now()}`,
            type: payload.type,
            page_id: payload.pageId,
            received_at: new Date().toISOString()
        }

        await db.createNotionEvent(eventData)

        // Process different event types
        switch (payload.type) {
            case 'page.created':
            case 'page.updated':
                await processNotionPage(payload.pageId, payload.type)
                break
            case 'database.updated':
                console.log('Database updated:', payload.databaseId)
                break
            default:
                console.log('Unhandled event type:', payload.type)
        }

        return new Response(JSON.stringify({
            status: 'received',
            pageId: payload.pageId,
            type: payload.type,
            message: 'Webhook processed successfully'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })

    } catch (error) {
        console.error('Webhook error:', error)

        return new Response(JSON.stringify({
            error: 'Internal server error',
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}

// Process Notion page events
async function processNotionPage(pageId, eventType) {
    try {
        console.log(`Processing ${eventType} for page:`, pageId)

        // Fetch page data from Notion
        const page = await notionClient.fetchPage(pageId)
        const pageContent = await notionClient.getPageContent(pageId)

        // Extract text content and properties
        const textContent = notionUtils.extractTextFromBlocks(pageContent)
        const properties = notionUtils.extractProperties(page)

        // For now, we'll create a generic user association
        // In a real app, you'd determine the user based on the database or page properties
        const userId = '00000000-0000-0000-0000-000000000000' // Placeholder

        // Store or update the page in our database
        const pageData = {
            notion_page_id: pageId,
            notion_database_id: page.parent?.database_id,
            title: properties.title || 'Untitled',
            content: {
                text: textContent,
                blocks: pageContent
            },
            properties: properties
        }

        // Check if page already exists
        const existingPage = await db.getNotionPages(userId).then(pages =>
            pages.find(p => p.notion_page_id === pageId)
        )

        if (existingPage) {
            await db.updateNotionPage(existingPage.id, userId, pageData)
        } else {
            await db.createNotionPage(userId, pageData)
        }

        // Perform AI analysis if it's a new page or significant update
        if (eventType === 'page.created' || shouldAnalyzePage(properties, textContent)) {
            await analyzeNotionPage(pageId, textContent, properties, userId)
        }

        console.log(`Successfully processed ${eventType} for page:`, pageId)

    } catch (error) {
        console.error('Error processing Notion page:', error)
        throw error
    }
}

// Determine if a page should be analyzed
function shouldAnalyzePage(properties, textContent) {
    // Analyze if:
    // - Content is substantial (> 100 characters)
    // - Has specific properties that indicate importance
    // - Contains keywords that suggest it needs analysis

    const importantKeywords = ['task', 'project', 'meeting', 'action', 'deadline', 'urgent']
    const hasImportantKeywords = importantKeywords.some(keyword =>
        textContent.toLowerCase().includes(keyword)
    )

    return textContent.length > 100 || hasImportantKeywords
}

// Analyze Notion page with AI
async function analyzeNotionPage(pageId, textContent, properties, userId) {
    try {
        console.log('Analyzing Notion page with AI:', pageId)

        // Perform AI analysis
        const analysisResult = await ai.analyzeNotionPage(
            { text: textContent, properties },
            { pageId, userId }
        )

        // Update the page with analysis results
        const existingPage = await db.getNotionPages(userId).then(pages =>
            pages.find(p => p.notion_page_id === pageId)
        )

        if (existingPage) {
            await db.updateNotionPage(existingPage.id, userId, {
                analysis_result: analysisResult,
                last_analyzed_at: new Date().toISOString()
            })
        }

        // Trigger workflows if any are configured for this type of content
        await triggerRelevantWorkflows(pageId, analysisResult, userId)

        console.log('AI analysis completed for page:', pageId)

    } catch (error) {
        console.error('Error analyzing Notion page:', error)
        // Don't throw - we don't want to fail the webhook if analysis fails
    }
}

// Trigger relevant workflows based on analysis
async function triggerRelevantWorkflows(pageId, analysisResult, userId) {
    try {
        // Get user's workflows that might be triggered by Notion events
        const workflows = await db.getWorkflows(userId)
        const notionWorkflows = workflows.filter(w =>
            w.trigger_type === 'notion' && w.status === 'active'
        )

        for (const workflow of notionWorkflows) {
            // Check if this workflow should be triggered based on analysis
            if (shouldTriggerWorkflow(workflow, analysisResult)) {
                await createWorkflowRun(workflow.id, userId, {
                    input_data: { pageId, analysisResult },
                    status: 'pending'
                })
            }
        }

    } catch (error) {
        console.error('Error triggering workflows:', error)
    }
}

// Determine if a workflow should be triggered
function shouldTriggerWorkflow(workflow, analysisResult) {
    const triggerConfig = workflow.trigger_config || {}
    const conditions = triggerConfig.conditions || []

    // Simple condition matching - in a real app, you'd have more sophisticated logic
    return conditions.some(condition => {
        switch (condition.type) {
            case 'category_match':
                return analysisResult.categories?.includes(condition.value)
            case 'sentiment_match':
                return analysisResult.sentiment === condition.value
            case 'has_action_items':
                return condition.value && analysisResult.action_items?.length > 0
            default:
                return false
        }
    })
}

// Create a workflow run
async function createWorkflowRun(workflowId, userId, runData) {
    try {
        await db.createWorkflowRun(workflowId, userId, runData)
        console.log('Created workflow run for workflow:', workflowId)
    } catch (error) {
        console.error('Error creating workflow run:', error)
    }
}

// This tells Next.js to use Node.js runtime (not Edge runtime)
export const runtime = 'nodejs'

// This tells Next.js to always run this function (don't cache it)
export const dynamic = 'force-dynamic'
