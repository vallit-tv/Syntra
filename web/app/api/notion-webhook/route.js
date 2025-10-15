// This is our Notion webhook API endpoint
// It handles POST requests from Notion when pages are created
// This is like a method in Java that handles HTTP requests

// This function handles POST requests to /api/notion-webhook
export async function POST(request) {
    try {
        // Get the raw body from the request
        const body = await request.text()

        // Get headers from the request
        const signature = request.headers.get('x-notion-signature') || ''
        const timestamp = request.headers.get('x-notion-timestamp') || ''

        // TODO: Add HMAC signature verification here
        // For now, we'll skip this for simplicity

        // Parse the JSON data from Notion
        const payload = JSON.parse(body)

        // Check if this is a page.created event
        if (payload.type !== 'page.created') {
            return new Response(JSON.stringify({ status: 'ignored' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // Get the page ID from the payload
        const pageId = payload.id

        // TODO: Add Notion API integration here
        // For now, we'll just log what we received
        console.log('Received page.created event for page:', pageId)

        // Return a success response
        return new Response(JSON.stringify({
            status: 'received',
            pageId: pageId,
            message: 'Webhook received successfully'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })

    } catch (error) {
        // If something goes wrong, return an error
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

// This tells Next.js to use Node.js runtime (not Edge runtime)
export const runtime = 'nodejs'

// This tells Next.js to always run this function (don't cache it)
export const dynamic = 'force-dynamic'
