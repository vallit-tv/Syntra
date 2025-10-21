// Notion API client and helper functions
import { Client } from '@notionhq/client'
import crypto from 'crypto'

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_TOKEN || 'placeholder-token',
})

// Helper functions for Notion operations
export const notionClient = {
    // Fetch a page by ID
    async fetchPage(pageId) {
        try {
            const response = await notion.pages.retrieve({ page_id: pageId })
            return response
        } catch (error) {
            console.error('Error fetching Notion page:', error)
            throw new Error(`Failed to fetch page ${pageId}`)
        }
    },

    // Update a page with new properties
    async updatePage(pageId, properties) {
        try {
            const response = await notion.pages.update({
                page_id: pageId,
                properties: properties
            })
            return response
        } catch (error) {
            console.error('Error updating Notion page:', error)
            throw new Error(`Failed to update page ${pageId}`)
        }
    },

    // Query a database
    async queryDatabase(databaseId, filter = {}, sorts = []) {
        try {
            const response = await notion.databases.query({
                database_id: databaseId,
                filter: filter,
                sorts: sorts
            })
            return response
        } catch (error) {
            console.error('Error querying Notion database:', error)
            throw new Error(`Failed to query database ${databaseId}`)
        }
    },

    // Create a new page in a database
    async createPage(databaseId, properties) {
        try {
            const response = await notion.pages.create({
                parent: { database_id: databaseId },
                properties: properties
            })
            return response
        } catch (error) {
            console.error('Error creating Notion page:', error)
            throw new Error(`Failed to create page in database ${databaseId}`)
        }
    },

    // Get page content (blocks)
    async getPageContent(pageId) {
        try {
            const response = await notion.blocks.children.list({
                block_id: pageId
            })
            return response.results
        } catch (error) {
            console.error('Error fetching page content:', error)
            throw new Error(`Failed to fetch content for page ${pageId}`)
        }
    },

    // Search pages and databases
    async search(query, filter = {}) {
        try {
            const response = await notion.search({
                query: query,
                filter: filter
            })
            return response.results
        } catch (error) {
            console.error('Error searching Notion:', error)
            throw new Error('Failed to search Notion')
        }
    },

    // Get database schema
    async getDatabaseSchema(databaseId) {
        try {
            const response = await notion.databases.retrieve({
                database_id: databaseId
            })
            return response.properties
        } catch (error) {
            console.error('Error fetching database schema:', error)
            throw new Error(`Failed to fetch schema for database ${databaseId}`)
        }
    }
}

// Utility functions for Notion data processing
export const notionUtils = {
    // Extract text content from Notion blocks
    extractTextFromBlocks(blocks) {
        const textContent = []

        const processBlock = (block) => {
            if (block.type === 'paragraph' && block.paragraph?.rich_text) {
                const text = block.paragraph.rich_text.map(rt => rt.plain_text).join('')
                if (text.trim()) textContent.push(text)
            } else if (block.type === 'heading_1' && block.heading_1?.rich_text) {
                const text = block.heading_1.rich_text.map(rt => rt.plain_text).join('')
                if (text.trim()) textContent.push(`# ${text}`)
            } else if (block.type === 'heading_2' && block.heading_2?.rich_text) {
                const text = block.heading_2.rich_text.map(rt => rt.plain_text).join('')
                if (text.trim()) textContent.push(`## ${text}`)
            } else if (block.type === 'heading_3' && block.heading_3?.rich_text) {
                const text = block.heading_3.rich_text.map(rt => rt.plain_text).join('')
                if (text.trim()) textContent.push(`### ${text}`)
            } else if (block.type === 'bulleted_list_item' && block.bulleted_list_item?.rich_text) {
                const text = block.bulleted_list_item.rich_text.map(rt => rt.plain_text).join('')
                if (text.trim()) textContent.push(`• ${text}`)
            } else if (block.type === 'numbered_list_item' && block.numbered_list_item?.rich_text) {
                const text = block.numbered_list_item.rich_text.map(rt => rt.plain_text).join('')
                if (text.trim()) textContent.push(`1. ${text}`)
            } else if (block.type === 'to_do' && block.to_do?.rich_text) {
                const text = block.to_do.rich_text.map(rt => rt.plain_text).join('')
                const checked = block.to_do.checked ? '✅' : '☐'
                if (text.trim()) textContent.push(`${checked} ${text}`)
            }

            // Process child blocks
            if (block.has_children) {
                // Note: This would require additional API calls to fetch children
                // For now, we'll skip nested blocks
            }
        }

        blocks.forEach(processBlock)
        return textContent.join('\n')
    },

    // Extract properties from a Notion page
    extractProperties(page) {
        const properties = {}

        if (page.properties) {
            Object.entries(page.properties).forEach(([key, prop]) => {
                switch (prop.type) {
                    case 'title':
                        properties[key] = prop.title?.map(t => t.plain_text).join('') || ''
                        break
                    case 'rich_text':
                        properties[key] = prop.rich_text?.map(t => t.plain_text).join('') || ''
                        break
                    case 'number':
                        properties[key] = prop.number
                        break
                    case 'select':
                        properties[key] = prop.select?.name || null
                        break
                    case 'multi_select':
                        properties[key] = prop.multi_select?.map(s => s.name) || []
                        break
                    case 'date':
                        properties[key] = prop.date?.start || null
                        break
                    case 'checkbox':
                        properties[key] = prop.checkbox || false
                        break
                    case 'url':
                        properties[key] = prop.url || null
                        break
                    case 'email':
                        properties[key] = prop.email || null
                        break
                    case 'phone_number':
                        properties[key] = prop.phone_number || null
                        break
                    case 'created_time':
                        properties[key] = prop.created_time
                        break
                    case 'created_by':
                        properties[key] = prop.created_by?.name || null
                        break
                    case 'last_edited_time':
                        properties[key] = prop.last_edited_time
                        break
                    case 'last_edited_by':
                        properties[key] = prop.last_edited_by?.name || null
                        break
                    default:
                        properties[key] = prop
                }
            })
        }

        return properties
    },

    // Create property update object
    createPropertyUpdate(propertyName, value, type = 'rich_text') {
        const update = {
            [propertyName]: {}
        }

        switch (type) {
            case 'title':
                update[propertyName] = {
                    title: [{ type: 'text', text: { content: value } }]
                }
                break
            case 'rich_text':
                update[propertyName] = {
                    rich_text: [{ type: 'text', text: { content: value } }]
                }
                break
            case 'number':
                update[propertyName] = { number: value }
                break
            case 'select':
                update[propertyName] = { select: { name: value } }
                break
            case 'multi_select':
                update[propertyName] = {
                    multi_select: value.map(v => ({ name: v }))
                }
                break
            case 'date':
                update[propertyName] = { date: { start: value } }
                break
            case 'checkbox':
                update[propertyName] = { checkbox: value }
                break
            case 'url':
                update[propertyName] = { url: value }
                break
            case 'email':
                update[propertyName] = { email: value }
                break
            case 'phone_number':
                update[propertyName] = { phone_number: value }
                break
        }

        return update
    }
}

// Webhook verification
export const webhookUtils = {
    // Verify Notion webhook signature
    verifySignature(payload, signature, secret) {
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(payload, 'utf8')
            .digest('hex')

        return crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        )
    },

    // Parse webhook payload
    parseWebhookPayload(payload) {
        try {
            const data = JSON.parse(payload)
            return {
                type: data.type,
                pageId: data.id,
                databaseId: data.parent?.database_id,
                properties: data.properties,
                timestamp: data.timestamp
            }
        } catch (error) {
            console.error('Error parsing webhook payload:', error)
            throw new Error('Invalid webhook payload')
        }
    }
}

export default notion
