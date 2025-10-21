// Workflows management page with visual builder
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '../../../components/AuthGuard'
import { auth } from '../../../lib/auth'

export default function WorkflowsPage() {
    const [user, setUser] = useState(null)
    const [workflows, setWorkflows] = useState([])
    const [templates, setTemplates] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showBuilder, setShowBuilder] = useState(false)
    const [selectedWorkflow, setSelectedWorkflow] = useState(null)
    const router = useRouter()

    useEffect(() => {
        loadWorkflowsData()
    }, [])

    const loadWorkflowsData = async () => {
        try {
            setLoading(true)

            // Get current user
            const currentUser = await auth.getCurrentUser()
            if (!currentUser) {
                router.push('/login')
                return
            }

            setUser(currentUser)

            // Load workflows and templates
            const [workflowsData, templatesData] = await Promise.all([
                fetch('/api/workflows').then(res => res.json()),
                fetch('/api/workflow-templates').then(res => res.json())
            ])

            setWorkflows(workflowsData.workflows || [])
            setTemplates(templatesData.templates || [])

        } catch (error) {
            console.error('Error loading workflows data:', error)
            setError('Failed to load workflows data')
        } finally {
            setLoading(false)
        }
    }

    const handleSignOut = async () => {
        try {
            await fetch('/api/auth/signout', { method: 'POST' })
            router.push('/')
        } catch (error) {
            console.error('Sign out error:', error)
        }
    }

    const handleCreateFromTemplate = async (template) => {
        try {
            const response = await fetch('/api/workflows', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: template.name,
                    description: template.description,
                    definition: {
                        trigger: template.trigger,
                        steps: template.steps,
                        error_handling: template.error_handling
                    },
                    trigger_type: template.trigger.type,
                    trigger_config: template.trigger.config,
                    status: 'draft'
                }),
            })

            if (response.ok) {
                await loadWorkflowsData()
                setShowBuilder(false)
            } else {
                setError('Failed to create workflow from template')
            }
        } catch (error) {
            console.error('Error creating workflow:', error)
            setError('Failed to create workflow')
        }
    }

    const handleToggleWorkflow = async (workflowId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'paused' : 'active'

            const response = await fetch(`/api/workflows/${workflowId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            })

            if (response.ok) {
                await loadWorkflowsData()
            } else {
                setError('Failed to update workflow status')
            }
        } catch (error) {
            console.error('Error updating workflow:', error)
            setError('Failed to update workflow')
        }
    }

    const handleDeleteWorkflow = async (workflowId) => {
        if (!confirm('Are you sure you want to delete this workflow?')) {
            return
        }

        try {
            const response = await fetch(`/api/workflows/${workflowId}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                await loadWorkflowsData()
            } else {
                setError('Failed to delete workflow')
            }
        } catch (error) {
            console.error('Error deleting workflow:', error)
            setError('Failed to delete workflow')
        }
    }

    if (loading) {
        return (
            <AuthGuard requireAuth={true}>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading workflows...</p>
                    </div>
                </div>
            </AuthGuard>
        )
    }

    return (
        <AuthGuard requireAuth={true}>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setShowBuilder(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                                >
                                    Create Workflow
                                </button>
                                <div className="text-sm text-gray-700">
                                    Welcome, {user?.email}
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="bg-gray-800 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Navigation */}
                <nav className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex space-x-8">
                            <a href="/dashboard" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                                Overview
                            </a>
                            <a href="/dashboard/workflows" className="border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                                Workflows
                            </a>
                            <a href="/dashboard/analytics" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                                Analytics
                            </a>
                            <a href="/dashboard/integrations" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                                Integrations
                            </a>
                            <a href="/dashboard/chat" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                                AI Chat
                            </a>
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* Workflow Builder Modal */}
                    {showBuilder && (
                        <WorkflowBuilderModal
                            templates={templates}
                            onClose={() => setShowBuilder(false)}
                            onCreateFromTemplate={handleCreateFromTemplate}
                        />
                    )}

                    {/* Workflows List */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Your Workflows</h3>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {workflows.length > 0 ? (
                                workflows.map((workflow) => (
                                    <div key={workflow.id} className="px-6 py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3">
                                                    <h4 className="text-sm font-medium text-gray-900">{workflow.name}</h4>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${workflow.status === 'active' ? 'bg-green-100 text-green-800' :
                                                            workflow.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {workflow.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">{workflow.description}</p>
                                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                                    <span>Trigger: {workflow.trigger_type}</span>
                                                    <span>Steps: {workflow.definition?.steps?.length || 0}</span>
                                                    <span>Created: {new Date(workflow.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => setSelectedWorkflow(workflow)}
                                                    className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleToggleWorkflow(workflow.id, workflow.status)}
                                                    className={`text-sm font-medium ${workflow.status === 'active'
                                                            ? 'text-yellow-600 hover:text-yellow-500'
                                                            : 'text-green-600 hover:text-green-500'
                                                        }`}
                                                >
                                                    {workflow.status === 'active' ? 'Pause' : 'Activate'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteWorkflow(workflow.id)}
                                                    className="text-red-600 hover:text-red-500 text-sm font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-6 py-8 text-center">
                                    <div className="text-gray-500">
                                        <span className="text-4xl mb-4 block">🤖</span>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows yet</h3>
                                        <p className="text-gray-500 mb-4">Create your first workflow to start automating your processes</p>
                                        <button
                                            onClick={() => setShowBuilder(true)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                                        >
                                            Create Your First Workflow
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    )
}

// Workflow Builder Modal Component
function WorkflowBuilderModal({ templates, onClose, onCreateFromTemplate }) {
    const [activeTab, setActiveTab] = useState('templates')
    const [selectedTemplate, setSelectedTemplate] = useState(null)

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Create New Workflow</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('templates')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'templates'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Templates
                            </button>
                            <button
                                onClick={() => setActiveTab('custom')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'custom'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Custom Builder
                            </button>
                            <button
                                onClick={() => setActiveTab('ai')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'ai'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                AI Assistant
                            </button>
                        </nav>
                    </div>

                    {/* Content */}
                    {activeTab === 'templates' && (
                        <div>
                            <h4 className="text-md font-medium text-gray-900 mb-4">Choose a Template</h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {templates.map((template) => (
                                    <div
                                        key={template.id}
                                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedTemplate?.id === template.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        onClick={() => setSelectedTemplate(template)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h5 className="text-sm font-medium text-gray-900">{template.name}</h5>
                                                <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                                                <div className="mt-2">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        {template.category}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <span className="text-2xl">
                                                    {template.category === 'notion' ? '📝' :
                                                        template.category === 'data_processing' ? '🔄' :
                                                            template.category === 'reporting' ? '📊' :
                                                                template.category === 'monitoring' ? '🔍' : '⚡'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {selectedTemplate && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <h5 className="text-sm font-medium text-gray-900 mb-2">Template Details</h5>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p><strong>Trigger:</strong> {selectedTemplate.trigger.type}</p>
                                        <p><strong>Steps:</strong> {selectedTemplate.steps.length} steps</p>
                                        <p><strong>Description:</strong> {selectedTemplate.description}</p>
                                    </div>
                                    <div className="mt-4">
                                        <button
                                            onClick={() => onCreateFromTemplate(selectedTemplate)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                                        >
                                            Create from Template
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'custom' && (
                        <div>
                            <h4 className="text-md font-medium text-gray-900 mb-4">Custom Workflow Builder</h4>
                            <div className="text-center py-8">
                                <span className="text-4xl mb-4 block">🚧</span>
                                <h5 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h5>
                                <p className="text-gray-500">Visual workflow builder is under development</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ai' && (
                        <div>
                            <h4 className="text-md font-medium text-gray-900 mb-4">AI Workflow Assistant</h4>
                            <div className="text-center py-8">
                                <span className="text-4xl mb-4 block">🤖</span>
                                <h5 className="text-lg font-medium text-gray-900 mb-2">AI Assistant</h5>
                                <p className="text-gray-500">Describe your workflow and let AI create it for you</p>
                                <div className="mt-4">
                                    <textarea
                                        className="w-full p-3 border border-gray-300 rounded-md"
                                        rows={4}
                                        placeholder="Describe the workflow you want to create..."
                                    />
                                    <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                                        Generate Workflow
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
