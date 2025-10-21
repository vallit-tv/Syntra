// Functional Dashboard with real data
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '../../components/AuthGuard'
import { auth } from '../../lib/auth'

export default function DashboardPage() {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [analytics, setAnalytics] = useState(null)
    const [workflows, setWorkflows] = useState([])
    const [recentRuns, setRecentRuns] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const router = useRouter()

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        try {
            setLoading(true)

            // Get current user
            const currentUser = await auth.getCurrentUser()
            if (!currentUser) {
                router.push('/login')
                return
            }

            setUser(currentUser)

            // Load user profile
            const userProfile = await auth.getUserProfile()
            setProfile(userProfile)

            // Load analytics summary
            const analyticsData = await fetch('/api/dashboard/analytics').then(res => res.json())
            setAnalytics(analyticsData)

            // Load workflows
            const workflowsData = await fetch('/api/workflows').then(res => res.json())
            setWorkflows(workflowsData.workflows || [])

            // Load recent workflow runs
            const runsData = await fetch('/api/workflow-runs?limit=5').then(res => res.json())
            setRecentRuns(runsData.runs || [])

        } catch (error) {
            console.error('Error loading dashboard data:', error)
            setError('Failed to load dashboard data')
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

    if (loading) {
        return (
            <AuthGuard requireAuth={true}>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading dashboard...</p>
                    </div>
                </div>
            </AuthGuard>
        )
    }

    return (
        <AuthGuard requireAuth={true}>
            <div className="min-h-screen bg-gray-50">
                {/* Dashboard Header */}
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <h1 className="text-2xl font-bold text-gray-900">Syntra Dashboard</h1>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="text-sm text-gray-700">
                                    Welcome, {profile?.full_name || user?.email}
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

                {/* Dashboard Navigation */}
                <nav className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex space-x-8">
                            <a href="/dashboard" className="border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                                Overview
                            </a>
                            <a href="/dashboard/workflows" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
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

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                                            <span className="text-white text-sm">🤖</span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Active Workflows</dt>
                                            <dd className="text-lg font-medium text-gray-900">{analytics?.active_workflows || 0}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                            <span className="text-white text-sm">✅</span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Successful Runs</dt>
                                            <dd className="text-lg font-medium text-gray-900">{analytics?.successful_runs || 0}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                                            <span className="text-white text-sm">📊</span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Total Runs</dt>
                                            <dd className="text-lg font-medium text-gray-900">{analytics?.total_runs || 0}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                                            <span className="text-white text-sm">💰</span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Total Cost</dt>
                                            <dd className="text-lg font-medium text-gray-900">${analytics?.total_cost || 0}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white shadow rounded-lg mb-8">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <a
                                    href="/dashboard/workflows/new"
                                    className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-300 hover:border-gray-400"
                                >
                                    <div>
                                        <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                                            <span className="text-xl">⚡</span>
                                        </span>
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="text-lg font-medium">
                                            <span className="absolute inset-0" aria-hidden="true" />
                                            Create Workflow
                                        </h3>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Build a new automation workflow with AI assistance
                                        </p>
                                    </div>
                                </a>

                                <a
                                    href="/dashboard/integrations"
                                    className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-300 hover:border-gray-400"
                                >
                                    <div>
                                        <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                                            <span className="text-xl">🔗</span>
                                        </span>
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="text-lg font-medium">
                                            <span className="absolute inset-0" aria-hidden="true" />
                                            Manage Integrations
                                        </h3>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Connect your tools and configure API keys
                                        </p>
                                    </div>
                                </a>

                                <a
                                    href="/dashboard/analytics"
                                    className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-300 hover:border-gray-400"
                                >
                                    <div>
                                        <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                                            <span className="text-xl">📈</span>
                                        </span>
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="text-lg font-medium">
                                            <span className="absolute inset-0" aria-hidden="true" />
                                            View Analytics
                                        </h3>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Analyze performance and optimize your workflows
                                        </p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Workflow Runs</h3>
                                {recentRuns.length > 0 ? (
                                    <div className="flow-root">
                                        <ul className="-mb-8">
                                            {recentRuns.map((run, index) => (
                                                <li key={run.id}>
                                                    <div className="relative pb-8">
                                                        {index !== recentRuns.length - 1 ? (
                                                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                                        ) : null}
                                                        <div className="relative flex space-x-3">
                                                            <div>
                                                                <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${run.status === 'completed' ? 'bg-green-500' :
                                                                    run.status === 'failed' ? 'bg-red-500' :
                                                                        run.status === 'running' ? 'bg-blue-500' :
                                                                            'bg-gray-400'
                                                                    }`}>
                                                                    <span className="text-white text-xs">
                                                                        {run.status === 'completed' ? '✓' :
                                                                            run.status === 'failed' ? '✗' :
                                                                                run.status === 'running' ? '⟳' : '○'}
                                                                    </span>
                                                                </span>
                                                            </div>
                                                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                                <div>
                                                                    <p className="text-sm text-gray-500">
                                                                        {run.workflows?.name || 'Unknown Workflow'}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                                    {new Date(run.created_at).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">No recent workflow runs</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-white shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Active Workflows</h3>
                                {workflows.length > 0 ? (
                                    <div className="space-y-3">
                                        {workflows.slice(0, 5).map((workflow) => (
                                            <div key={workflow.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{workflow.name}</p>
                                                    <p className="text-xs text-gray-500">{workflow.description}</p>
                                                </div>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${workflow.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    workflow.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {workflow.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">No workflows created yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    )
}