// Supabase client configuration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

// Client for browser usage (with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
})

// Admin client for server-side usage (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

// Helper functions for common operations
export const db = {
    // User operations
    async getUserProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) throw error
        return data
    },

    async updateUserProfile(userId, updates) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Workflow operations
    async getWorkflows(userId) {
        const { data, error } = await supabase
            .from('workflows')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    async getWorkflow(workflowId, userId) {
        const { data, error } = await supabase
            .from('workflows')
            .select('*')
            .eq('id', workflowId)
            .eq('user_id', userId)
            .single()

        if (error) throw error
        return data
    },

    async createWorkflow(userId, workflowData) {
        const { data, error } = await supabase
            .from('workflows')
            .insert({
                user_id: userId,
                ...workflowData
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateWorkflow(workflowId, userId, updates) {
        const { data, error } = await supabase
            .from('workflows')
            .update(updates)
            .eq('id', workflowId)
            .eq('user_id', userId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async deleteWorkflow(workflowId, userId) {
        const { error } = await supabase
            .from('workflows')
            .delete()
            .eq('id', workflowId)
            .eq('user_id', userId)

        if (error) throw error
    },

    // Workflow runs operations
    async getWorkflowRuns(userId, limit = 50) {
        const { data, error } = await supabase
            .from('workflow_runs')
            .select(`
        *,
        workflows (
          name,
          description
        )
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) throw error
        return data
    },

    async createWorkflowRun(workflowId, userId, runData) {
        const { data, error } = await supabase
            .from('workflow_runs')
            .insert({
                workflow_id: workflowId,
                user_id: userId,
                ...runData
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateWorkflowRun(runId, updates) {
        const { data, error } = await supabase
            .from('workflow_runs')
            .update(updates)
            .eq('id', runId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // API Keys operations
    async getApiKeys(userId) {
        const { data, error } = await supabase
            .from('api_keys')
            .select('id, name, type, is_active, last_used_at, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    async createApiKey(userId, keyData) {
        const { data, error } = await supabase
            .from('api_keys')
            .insert({
                user_id: userId,
                ...keyData
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateApiKey(keyId, userId, updates) {
        const { data, error } = await supabase
            .from('api_keys')
            .update(updates)
            .eq('id', keyId)
            .eq('user_id', userId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async deleteApiKey(keyId, userId) {
        const { error } = await supabase
            .from('api_keys')
            .delete()
            .eq('id', keyId)
            .eq('user_id', userId)

        if (error) throw error
    },

    // Analytics operations
    async trackEvent(userId, eventType, eventData = {}) {
        const { error } = await supabase
            .from('analytics_events')
            .insert({
                user_id: userId,
                event_type: eventType,
                event_data: eventData
            })

        if (error) throw error
    },

    async getAnalyticsSummary(userId) {
        const { data, error } = await supabase
            .rpc('get_user_analytics_summary', { user_uuid: userId })

        if (error) throw error
        return data
    },

    // Notion operations
    async getNotionPages(userId) {
        const { data, error } = await supabase
            .from('notion_pages')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false })

        if (error) throw error
        return data
    },

    async createNotionPage(userId, pageData) {
        const { data, error } = await supabase
            .from('notion_pages')
            .insert({
                user_id: userId,
                ...pageData
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateNotionPage(pageId, userId, updates) {
        const { data, error } = await supabase
            .from('notion_pages')
            .update(updates)
            .eq('id', pageId)
            .eq('user_id', userId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Notion events operations
    async createNotionEvent(eventData) {
        const { data, error } = await supabaseAdmin
            .from('notion_events')
            .insert(eventData)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async getWorkflowStats(workflowId) {
        const { data, error } = await supabase
            .rpc('get_workflow_stats', { workflow_uuid: workflowId })

        if (error) throw error
        return data
    },

    async getUnprocessedNotionEvents() {
        const { data, error } = await supabaseAdmin
            .from('notion_events')
            .select('*')
            .eq('processed', false)
            .order('received_at', { ascending: true })

        if (error) throw error
        return data
    },

    async markNotionEventProcessed(eventId) {
        const { error } = await supabaseAdmin
            .from('notion_events')
            .update({ processed: true })
            .eq('id', eventId)

        if (error) throw error
    }
}

export default supabase
