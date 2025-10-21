// Workflow execution engine with AI-powered decision making
import { ai } from '../openai'
import { notionClient, notionUtils } from '../notion'
import { db } from '../supabase'

export class WorkflowExecutor {
    constructor(workflow, userId) {
        this.workflow = workflow
        this.userId = userId
        this.context = {}
        this.results = []
        this.errors = []
    }

    // Main execution method
    async execute(inputData = {}) {
        const startTime = Date.now()
        let runId = null

        try {
            // Create workflow run record
            runId = await this.createRunRecord(inputData)

            // Initialize context
            this.context = {
                input: inputData,
                workflow: this.workflow,
                user: this.userId,
                timestamp: new Date().toISOString()
            }

            // Execute workflow steps
            await this.executeSteps()

            // Calculate execution time
            const executionTime = Date.now() - startTime

            // Update run record with success
            await this.updateRunRecord(runId, {
                status: 'completed',
                output_data: this.results,
                execution_time_ms: executionTime,
                completed_at: new Date().toISOString()
            })

            return {
                success: true,
                runId,
                results: this.results,
                executionTime
            }

        } catch (error) {
            console.error('Workflow execution error:', error)

            // Update run record with failure
            if (runId) {
                await this.updateRunRecord(runId, {
                    status: 'failed',
                    error_message: error.message,
                    execution_time_ms: Date.now() - startTime,
                    completed_at: new Date().toISOString()
                })
            }

            return {
                success: false,
                runId,
                error: error.message,
                results: this.results
            }
        }
    }

    // Create workflow run record
    async createRunRecord(inputData) {
        const run = await db.createWorkflowRun(this.workflow.id, this.userId, {
            status: 'running',
            input_data: inputData,
            started_at: new Date().toISOString()
        })
        return run.id
    }

    // Update workflow run record
    async updateRunRecord(runId, updates) {
        await db.updateWorkflowRun(runId, updates)
    }

    // Execute all workflow steps
    async executeSteps() {
        const steps = this.workflow.definition.steps || []
        let currentStep = this.findFirstStep(steps)

        while (currentStep) {
            try {
                const result = await this.executeStep(currentStep)
                this.results.push(result)

                // Update context with step result
                this.context[`step_${currentStep.id}`] = result

                // Find next step
                currentStep = this.findNextStep(steps, currentStep, result)

            } catch (error) {
                this.errors.push({
                    step: currentStep.id,
                    error: error.message
                })

                // Handle step error
                if (this.workflow.definition.error_handling?.retry_count > 0) {
                    // Retry logic could be implemented here
                }

                throw error
            }
        }
    }

    // Execute a single workflow step
    async executeStep(step) {
        console.log(`Executing step: ${step.id} (${step.type})`)

        switch (step.type) {
            case 'ai_analysis':
                return await this.executeAIAnalysis(step)
            case 'data_transform':
                return await this.executeDataTransform(step)
            case 'notion_action':
                return await this.executeNotionAction(step)
            case 'condition':
                return await this.executeCondition(step)
            case 'notification':
                return await this.executeNotification(step)
            case 'webhook':
                return await this.executeWebhook(step)
            case 'delay':
                return await this.executeDelay(step)
            default:
                throw new Error(`Unknown step type: ${step.type}`)
        }
    }

    // Execute AI analysis step
    async executeAIAnalysis(step) {
        const config = step.config || {}
        const data = this.resolveContextValue(config.data) || this.context.input

        let analysisResult
        switch (config.analysis_type) {
            case 'notion_page':
                analysisResult = await ai.analyzeNotionPage(data, this.context)
                break
            case 'workflow_insights':
                analysisResult = await ai.generateWorkflowInsights(data, this.context)
                break
            default:
                analysisResult = await ai.analyzeData(data, this.context)
        }

        return {
            step_id: step.id,
            type: 'ai_analysis',
            result: analysisResult,
            timestamp: new Date().toISOString()
        }
    }

    // Execute data transformation step
    async executeDataTransform(step) {
        const config = step.config || {}
        const inputData = this.resolveContextValue(config.input) || this.context.input

        // Simple data transformation logic
        let transformedData = inputData

        if (config.mapping) {
            transformedData = this.applyDataMapping(inputData, config.mapping)
        }

        if (config.filter) {
            transformedData = this.applyFilter(transformedData, config.filter)
        }

        return {
            step_id: step.id,
            type: 'data_transform',
            result: transformedData,
            timestamp: new Date().toISOString()
        }
    }

    // Execute Notion action step
    async executeNotionAction(step) {
        const config = step.config || {}
        const action = config.action

        switch (action) {
            case 'create_page':
                return await this.createNotionPage(step, config)
            case 'update_page':
                return await this.updateNotionPage(step, config)
            case 'query_database':
                return await this.queryNotionDatabase(step, config)
            default:
                throw new Error(`Unknown Notion action: ${action}`)
        }
    }

    // Create Notion page
    async createNotionPage(step, config) {
        const databaseId = this.resolveContextValue(config.database_id)
        const properties = this.resolveContextValue(config.properties) || {}

        const page = await notionClient.createPage(databaseId, properties)

        return {
            step_id: step.id,
            type: 'notion_action',
            action: 'create_page',
            result: { page_id: page.id, url: page.url },
            timestamp: new Date().toISOString()
        }
    }

    // Update Notion page
    async updateNotionPage(step, config) {
        const pageId = this.resolveContextValue(config.page_id)
        const properties = this.resolveContextValue(config.properties) || {}

        const page = await notionClient.updatePage(pageId, properties)

        return {
            step_id: step.id,
            type: 'notion_action',
            action: 'update_page',
            result: { page_id: page.id, url: page.url },
            timestamp: new Date().toISOString()
        }
    }

    // Query Notion database
    async queryNotionDatabase(step, config) {
        const databaseId = this.resolveContextValue(config.database_id)
        const filter = this.resolveContextValue(config.filter) || {}
        const sorts = this.resolveContextValue(config.sorts) || []

        const response = await notionClient.queryDatabase(databaseId, filter, sorts)

        return {
            step_id: step.id,
            type: 'notion_action',
            action: 'query_database',
            result: { pages: response.results, has_more: response.has_more },
            timestamp: new Date().toISOString()
        }
    }

    // Execute condition step
    async executeCondition(step) {
        const config = step.config || {}
        const condition = config.condition

        const result = this.evaluateCondition(condition)

        return {
            step_id: step.id,
            type: 'condition',
            result: { condition_met: result },
            timestamp: new Date().toISOString()
        }
    }

    // Execute notification step
    async executeNotification(step) {
        const config = step.config || {}
        const message = this.resolveContextValue(config.message)
        const type = config.type || 'info'

        // In a real implementation, this would send actual notifications
        console.log(`Notification (${type}): ${message}`)

        return {
            step_id: step.id,
            type: 'notification',
            result: { message, type, sent: true },
            timestamp: new Date().toISOString()
        }
    }

    // Execute webhook step
    async executeWebhook(step) {
        const config = step.config || {}
        const url = this.resolveContextValue(config.url)
        const method = config.method || 'POST'
        const headers = this.resolveContextValue(config.headers) || {}
        const body = this.resolveContextValue(config.body)

        // In a real implementation, this would make HTTP requests
        console.log(`Webhook: ${method} ${url}`)

        return {
            step_id: step.id,
            type: 'webhook',
            result: { url, method, status: 'sent' },
            timestamp: new Date().toISOString()
        }
    }

    // Execute delay step
    async executeDelay(step) {
        const config = step.config || {}
        const delayMs = config.delay_ms || 1000

        await new Promise(resolve => setTimeout(resolve, delayMs))

        return {
            step_id: step.id,
            type: 'delay',
            result: { delay_ms: delayMs },
            timestamp: new Date().toISOString()
        }
    }

    // Helper methods
    findFirstStep(steps) {
        return steps.find(step => !step.depends_on)
    }

    findNextStep(steps, currentStep, result) {
        if (!currentStep.next) return null

        // Handle conditional next steps
        if (typeof currentStep.next === 'object') {
            const condition = currentStep.next.condition
            if (this.evaluateCondition(condition)) {
                return steps.find(step => step.id === currentStep.next.true)
            } else {
                return steps.find(step => step.id === currentStep.next.false)
            }
        }

        // Handle simple next step
        return steps.find(step => step.id === currentStep.next)
    }

    evaluateCondition(condition) {
        if (!condition) return true

        const { field, operator, value } = condition
        const fieldValue = this.resolveContextValue(field)

        switch (operator) {
            case 'equals':
                return fieldValue === value
            case 'not_equals':
                return fieldValue !== value
            case 'contains':
                return String(fieldValue).includes(String(value))
            case 'greater_than':
                return Number(fieldValue) > Number(value)
            case 'less_than':
                return Number(fieldValue) < Number(value)
            case 'exists':
                return fieldValue !== undefined && fieldValue !== null
            default:
                return false
        }
    }

    resolveContextValue(value) {
        if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
            const path = value.slice(2, -2).trim()
            return this.getNestedValue(this.context, path)
        }
        return value
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj)
    }

    applyDataMapping(data, mapping) {
        const result = {}
        for (const [targetKey, sourcePath] of Object.entries(mapping)) {
            result[targetKey] = this.getNestedValue(data, sourcePath)
        }
        return result
    }

    applyFilter(data, filter) {
        if (Array.isArray(data)) {
            return data.filter(item => this.evaluateCondition(filter))
        }
        return data
    }
}

// Workflow execution API
export async function executeWorkflow(workflowId, userId, inputData = {}) {
    try {
        // Get workflow definition
        const workflow = await db.getWorkflow(workflowId, userId)
        if (!workflow) {
            throw new Error('Workflow not found')
        }

        if (workflow.status !== 'active') {
            throw new Error('Workflow is not active')
        }

        // Create executor and run workflow
        const executor = new WorkflowExecutor(workflow, userId)
        const result = await executor.execute(inputData)

        return result

    } catch (error) {
        console.error('Workflow execution error:', error)
        throw error
    }
}

export default WorkflowExecutor
