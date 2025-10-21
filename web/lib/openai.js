// OpenAI client configuration and helper functions
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-key',
})

// Helper functions for AI agent operations
export const ai = {
    // Analyze data and extract insights
    async analyzeData(data, context = {}) {
        try {
            const prompt = `
        Analyze the following data and provide insights:
        
        Data: ${JSON.stringify(data, null, 2)}
        Context: ${JSON.stringify(context, null, 2)}
        
        Please provide:
        1. Key patterns and trends
        2. Anomalies or outliers
        3. Actionable insights
        4. Recommendations
        
        Format your response as JSON with the following structure:
        {
          "patterns": ["pattern1", "pattern2"],
          "anomalies": ["anomaly1", "anomaly2"],
          "insights": ["insight1", "insight2"],
          "recommendations": ["recommendation1", "recommendation2"],
          "confidence": 0.85
        }
      `

            const response = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert data analyst. Provide clear, actionable insights based on the data provided. Always respond with valid JSON."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 2000
            })

            const content = response.choices[0].message.content
            return JSON.parse(content)
        } catch (error) {
            console.error('Error analyzing data:', error)
            throw new Error('Failed to analyze data')
        }
    },

    // Convert natural language to workflow definition
    async createWorkflowFromDescription(description, context = {}) {
        try {
            const prompt = `
        Convert the following natural language description into a structured workflow definition:
        
        Description: ${description}
        Context: ${JSON.stringify(context, null, 2)}
        
        Create a workflow that includes:
        1. Trigger configuration
        2. Action steps
        3. Conditional logic
        4. Error handling
        
        Format your response as JSON with the following structure:
        {
          "name": "Workflow Name",
          "description": "Workflow description",
          "trigger": {
            "type": "notion|webhook|schedule|manual",
            "config": {}
          },
          "steps": [
            {
              "id": "step1",
              "type": "ai_analysis|data_transform|notification|condition",
              "name": "Step Name",
              "config": {},
              "next": "step2"
            }
          ],
          "error_handling": {
            "retry_count": 3,
            "fallback_action": "notify"
          }
        }
      `

            const response = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are a workflow automation expert. Convert natural language descriptions into structured workflow definitions. Always respond with valid JSON."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.2,
                max_tokens: 3000
            })

            const content = response.choices[0].message.content
            return JSON.parse(content)
        } catch (error) {
            console.error('Error creating workflow:', error)
            throw new Error('Failed to create workflow from description')
        }
    },

    // Analyze Notion page content
    async analyzeNotionPage(pageContent, pageProperties = {}) {
        try {
            const prompt = `
        Analyze this Notion page content and extract structured information:
        
        Content: ${JSON.stringify(pageContent, null, 2)}
        Properties: ${JSON.stringify(pageProperties, null, 2)}
        
        Please provide:
        1. Content summary
        2. Key topics and themes
        3. Action items or tasks
        4. Important dates or deadlines
        5. Categorization suggestions
        6. Sentiment analysis
        
        Format your response as JSON:
        {
          "summary": "Brief summary of the content",
          "topics": ["topic1", "topic2"],
          "action_items": ["action1", "action2"],
          "dates": ["date1", "date2"],
          "categories": ["category1", "category2"],
          "sentiment": "positive|negative|neutral",
          "confidence": 0.85,
          "suggested_workflows": ["workflow1", "workflow2"]
        }
      `

            const response = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert at analyzing Notion pages and extracting structured information. Always respond with valid JSON."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 2000
            })

            const content = response.choices[0].message.content
            return JSON.parse(content)
        } catch (error) {
            console.error('Error analyzing Notion page:', error)
            throw new Error('Failed to analyze Notion page')
        }
    },

    // Generate insights from workflow execution data
    async generateWorkflowInsights(workflowRuns, workflowDefinition) {
        try {
            const prompt = `
        Analyze these workflow execution results and provide insights:
        
        Workflow Definition: ${JSON.stringify(workflowDefinition, null, 2)}
        Execution History: ${JSON.stringify(workflowRuns, null, 2)}
        
        Please provide:
        1. Performance analysis
        2. Success/failure patterns
        3. Optimization suggestions
        4. Cost analysis
        5. Reliability metrics
        
        Format your response as JSON:
        {
          "performance": {
            "avg_execution_time": 1500,
            "success_rate": 0.95,
            "bottlenecks": ["step1", "step2"]
          },
          "patterns": {
            "common_failures": ["error1", "error2"],
            "peak_times": ["time1", "time2"]
          },
          "optimizations": ["optimization1", "optimization2"],
          "cost_analysis": {
            "total_cost": 12.50,
            "cost_per_run": 0.25,
            "cost_trend": "increasing"
          },
          "recommendations": ["recommendation1", "recommendation2"]
        }
      `

            const response = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are a workflow optimization expert. Analyze execution data and provide actionable insights. Always respond with valid JSON."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.2,
                max_tokens: 2500
            })

            const content = response.choices[0].message.content
            return JSON.parse(content)
        } catch (error) {
            console.error('Error generating workflow insights:', error)
            throw new Error('Failed to generate workflow insights')
        }
    },

    // Chat interface for conversational AI
    async chat(message, context = {}) {
        try {
            const systemPrompt = `
        You are Syntra, an AI assistant that helps with workflow automation and data analysis.
        
        Context: ${JSON.stringify(context, null, 2)}
        
        You can help users with:
        - Creating and managing workflows
        - Analyzing data and generating insights
        - Troubleshooting automation issues
        - Optimizing business processes
        - Understanding Notion integration features
        
        Be helpful, concise, and actionable in your responses.
      `

            const response = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })

            return response.choices[0].message.content
        } catch (error) {
            console.error('Error in chat:', error)
            throw new Error('Failed to process chat message')
        }
    },

    // Calculate cost for API usage
    calculateCost(model, inputTokens, outputTokens) {
        const pricing = {
            'gpt-4': { input: 0.03, output: 0.06 }, // per 1K tokens
            'gpt-4-turbo': { input: 0.01, output: 0.03 },
            'gpt-3.5-turbo': { input: 0.001, output: 0.002 }
        }

        const modelPricing = pricing[model] || pricing['gpt-4']
        const inputCost = (inputTokens / 1000) * modelPricing.input
        const outputCost = (outputTokens / 1000) * modelPricing.output

        return inputCost + outputCost
    }
}

export default openai
