// API Integration Management Interface
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '../../../components/AuthGuard'
import { auth } from '../../../lib/auth'

export default function IntegrationsPage() {
    const [user, setUser] = useState(null)
    const [apiKeys, setApiKeys] = useState([])
    const [integrations, setIntegrations] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showAddKey, setShowAddKey] = useState(false)
    const [newKey, setNewKey] = useState({
        name: '',
        type: 'openai',
        key: ''
    })
    const router = useRouter()

    useEffect(() => {
        loadIntegrationsData()
    }, [])

    const loadIntegrationsData = async () => {
        try {
            setLoading(true)

            // Get current user
            const currentUser = await auth.getCurrentUser()
            if (!currentUser) {
                router.push('/login')
                return
            }

            setUser(currentUser)

            // Load API keys and integrations
            const [apiKeysData, integrationsData] = await Promise.all([
                fetch('/api/integrations/api-keys').then(res => res.json()),
                fetch('/api/integrations/status').then(res => res.json())
            ])

            setApiKeys(apiKeysData.keys || [])
            setIntegrations(integrationsData.integrations || [])

        } catch (error) {
            console.error('Error loading integrations data:', error)
            setError('Failed to load integrations data')
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

    const handleAddApiKey = async (e) => {
        e.preventDefault()

        try {
            const response = await fetch('/api/integrations/api-keys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newKey),
            })

            if (response.ok) {
                setNewKey({ name: '', type: 'openai', key: '' })
                setShowAddKey(false)
                await loadIntegrationsData()
            } else {
                const data = await response.json()
                setError(data.error || 'Failed to add API key')
            }
        } catch (error) {
            console.error('Error adding API key:', error)
            setError('Failed to add API key')
        }
    }

    const handleDeleteApiKey = async (keyId) => {
        if (!confirm('Are you sure you want to delete this API key?')) {
            return
        }

        try {
            const response = await fetch(`/api/integrations/api-keys/${keyId}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                await loadIntegrationsData()
            } else {
                setError('Failed to delete API key')
            }
        } catch (error) {
            console.error('Error deleting API key:', error)
            setError('Failed to delete API key')
        }
    }

    const handleToggleApiKey = async (keyId, currentStatus) => {
        try {
            const newStatus = currentStatus ? false : true

            const response = await fetch(`/api/integrations/api-keys/${keyId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ is_active: newStatus }),
            })

            if (response.ok) {
                await loadIntegrationsData()
            } else {
                setError('Failed to update API key status')
            }
        } catch (error) {
            console.error('Error updating API key:', error)
            setError('Failed to update API key')
        }
    }

    const getIntegrationIcon = (type) => {
        switch (type) {
            case 'openai': return '🤖'
            case 'notion': return '📝'
            case 'webhook': return '🔗'
            case 'api_key': return '🔑'
            default: return '⚡'
        }
    }

    const getIntegrationStatus = (integration) => {
        if (integration.connected && integration.valid) {
            return { status: 'connected', color: 'green', text: 'Connected' }
        } else if (integration.connected && !integration.valid) {
            return { status: 'error', color: 'red', text: 'Invalid Key' }
        } else {
            return { status: 'disconnected', color: 'gray', text: 'Not Connected' }
        }
    }

    if (loading) {
        return (
            <AuthGuard requireAuth={true}>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading integrations...</p>
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
                                    <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setShowAddKey(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                                >
                                    Add API Key
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
                            <a href="/dashboard/workflows" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                                Workflows
                            </a>
                            <a href="/dashboard/analytics" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                                Analytics
                            </a>
                            <a href="/dashboard/integrations" className="border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
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

                    {/* Add API Key Modal */}
                    {showAddKey && (
                        <AddApiKeyModal
                            newKey={newKey}
                            setNewKey={setNewKey}
                            onSubmit={handleAddApiKey}
                            onClose={() => setShowAddKey(false)}
                        />
                    )}

                    {/* Integration Status Overview */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                        {integrations.map((integration) => {
                            const status = getIntegrationStatus(integration)
                            return (
                                <div key={integration.type} className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                                                    <span className="text-lg">{getIntegrationIcon(integration.type)}</span>
                                                </div>
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate capitalize">
                                                        {integration.type.replace('_', ' ')}
                                                    </dt>
                                                    <dd className="flex items-center">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color === 'green' ? 'bg-green-100 text-green-800' :
                                                                status.color === 'red' ? 'bg-red-100 text-red-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {status.text}
                                                        </span>
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* API Keys Management */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">API Keys</h3>
                            <p className="text-sm text-gray-500 mt-1">Manage your API keys for different services</p>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {apiKeys.length > 0 ? (
                                apiKeys.map((key) => (
                                    <div key={key.id} className="px-6 py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    <span className="text-2xl">{getIntegrationIcon(key.type)}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        <h4 className="text-sm font-medium text-gray-900">{key.name}</h4>
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            {key.type}
                                                        </span>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${key.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {key.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                                        <span>Created: {new Date(key.created_at).toLocaleDateString()}</span>
                                                        {key.last_used_at && (
                                                            <span>Last used: {new Date(key.last_used_at).toLocaleDateString()}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleToggleApiKey(key.id, key.is_active)}
                                                    className={`text-sm font-medium ${key.is_active
                                                            ? 'text-yellow-600 hover:text-yellow-500'
                                                            : 'text-green-600 hover:text-green-500'
                                                        }`}
                                                >
                                                    {key.is_active ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteApiKey(key.id)}
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
                                        <span className="text-4xl mb-4 block">🔑</span>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No API keys configured</h3>
                                        <p className="text-gray-500 mb-4">Add API keys to enable integrations with external services</p>
                                        <button
                                            onClick={() => setShowAddKey(true)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                                        >
                                            Add Your First API Key
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Integration Guides */}
                    <div className="mt-8 bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Integration Guides</h3>
                            <p className="text-sm text-gray-500 mt-1">Learn how to set up different integrations</p>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <span className="text-2xl">🤖</span>
                                        <h4 className="text-sm font-medium text-gray-900">OpenAI</h4>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-3">
                                        Enable AI-powered analysis and workflow automation
                                    </p>
                                    <a
                                        href="https://platform.openai.com/api-keys"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                                    >
                                        Get API Key →
                                    </a>
                                </div>

                                <div className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <span className="text-2xl">📝</span>
                                        <h4 className="text-sm font-medium text-gray-900">Notion</h4>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-3">
                                        Connect your Notion workspace for page analysis
                                    </p>
                                    <a
                                        href="https://www.notion.so/my-integrations"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                                    >
                                        Get Integration Token →
                                    </a>
                                </div>

                                <div className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <span className="text-2xl">🔗</span>
                                        <h4 className="text-sm font-medium text-gray-900">Webhooks</h4>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-3">
                                        Set up webhooks to trigger workflows from external services
                                    </p>
                                    <a
                                        href="/dashboard/webhooks"
                                        className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                                    >
                                        Configure Webhooks →
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    )
}

// Add API Key Modal Component
function AddApiKeyModal({ newKey, setNewKey, onSubmit, onClose }) {
    const handleChange = (e) => {
        setNewKey({
            ...newKey,
            [e.target.name]: e.target.value
        })
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Add API Key</h3>
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

                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Key Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                required
                                value={newKey.name}
                                onChange={handleChange}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="e.g., My OpenAI Key"
                            />
                        </div>

                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                                Service Type
                            </label>
                            <select
                                name="type"
                                id="type"
                                value={newKey.type}
                                onChange={handleChange}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="openai">OpenAI</option>
                                <option value="notion">Notion</option>
                                <option value="webhook">Webhook</option>
                                <option value="api_key">Generic API Key</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="key" className="block text-sm font-medium text-gray-700">
                                API Key
                            </label>
                            <input
                                type="password"
                                name="key"
                                id="key"
                                required
                                value={newKey.key}
                                onChange={handleChange}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Enter your API key"
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                                Add Key
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
