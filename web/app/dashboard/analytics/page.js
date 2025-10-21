// Analytics Dashboard with charts and real-time metrics
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '../../../components/AuthGuard'
import { auth } from '../../../lib/auth'
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'

export default function AnalyticsPage() {
    const [user, setUser] = useState(null)
    const [analytics, setAnalytics] = useState(null)
    const [workflowStats, setWorkflowStats] = useState([])
    const [executionHistory, setExecutionHistory] = useState([])
    const [costTrends, setCostTrends] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [timeRange, setTimeRange] = useState('7d')
    const router = useRouter()

    useEffect(() => {
        loadAnalyticsData()
    }, [timeRange])

    const loadAnalyticsData = async () => {
        try {
            setLoading(true)

            // Get current user
            const currentUser = await auth.getCurrentUser()
            if (!currentUser) {
                router.push('/login')
                return
            }

            setUser(currentUser)

            // Load analytics data
            const [analyticsData, workflowStatsData, executionData, costData] = await Promise.all([
                fetch('/api/dashboard/analytics').then(res => res.json()),
                fetch('/api/analytics/workflow-stats').then(res => res.json()),
                fetch(`/api/analytics/execution-history?range=${timeRange}`).then(res => res.json()),
                fetch(`/api/analytics/cost-trends?range=${timeRange}`).then(res => res.json())
            ])

            setAnalytics(analyticsData)
            setWorkflowStats(workflowStatsData.stats || [])
            setExecutionHistory(executionData.history || [])
            setCostTrends(costData.trends || [])

        } catch (error) {
            console.error('Error loading analytics data:', error)
            setError('Failed to load analytics data')
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

    // Chart colors
    const colors = {
        primary: '#3B82F6',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        purple: '#8B5CF6',
        pink: '#EC4899'
    }

    const pieColors = [colors.primary, colors.success, colors.warning, colors.danger, colors.purple]

    if (loading) {
        return (
            <AuthGuard requireAuth={true}>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading analytics...</p>
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
                                    <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
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
                            <a href="/dashboard/analytics" className="border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
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

                    {/* Time Range Selector */}
                    <div className="mb-6 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">Performance Analytics</h2>
                        <div className="flex space-x-2">
                            {['24h', '7d', '30d', '90d'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-3 py-1 text-sm font-medium rounded-md ${timeRange === range
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                                            <span className="text-white text-sm">📊</span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Total Executions</dt>
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
                                        <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                            <span className="text-white text-sm">✅</span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Success Rate</dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {analytics?.total_runs > 0
                                                    ? Math.round((analytics.successful_runs / analytics.total_runs) * 100)
                                                    : 0}%
                                            </dd>
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
                                            <span className="text-white text-sm">⏱️</span>
                                        </div>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Avg Execution Time</dt>
                                            <dd className="text-lg font-medium text-gray-900">
                                                {analytics?.avg_execution_time ?
                                                    `${Math.round(analytics.avg_execution_time / 1000)}s` :
                                                    '0s'
                                                }
                                            </dd>
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

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
                        {/* Execution History Chart */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Execution History</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={executionHistory}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Area
                                        type="monotone"
                                        dataKey="successful"
                                        stackId="1"
                                        stroke={colors.success}
                                        fill={colors.success}
                                        name="Successful"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="failed"
                                        stackId="1"
                                        stroke={colors.danger}
                                        fill={colors.danger}
                                        name="Failed"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Cost Trends Chart */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Trends</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={costTrends}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="cost"
                                        stroke={colors.primary}
                                        strokeWidth={2}
                                        name="Daily Cost"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Workflow Performance */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
                        {/* Workflow Success Rates */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Workflow Success Rates</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={workflowStats}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [`${value}%`, 'Success Rate']} />
                                    <Bar dataKey="success_rate" fill={colors.primary} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Execution Time Distribution */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Execution Time Distribution</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Fast (< 1s)', value: 45, color: colors.success },
                                            { name: 'Medium (1-5s)', value: 35, color: colors.warning },
                                            { name: 'Slow (> 5s)', value: 20, color: colors.danger }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {[
                                            { name: 'Fast (< 1s)', value: 45, color: colors.success },
                                            { name: 'Medium (1-5s)', value: 35, color: colors.warning },
                                            { name: 'Slow (> 5s)', value: 20, color: colors.danger }
                                        ].map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Detailed Workflow Stats */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Workflow Performance Details</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Workflow
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Executions
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Success Rate
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Avg Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Cost
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Last Run
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {workflowStats.map((workflow) => (
                                        <tr key={workflow.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{workflow.name}</div>
                                                <div className="text-sm text-gray-500">{workflow.description}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {workflow.total_runs}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${workflow.success_rate >= 90 ? 'bg-green-100 text-green-800' :
                                                        workflow.success_rate >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {workflow.success_rate}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {workflow.avg_execution_time ?
                                                    `${Math.round(workflow.avg_execution_time / 1000)}s` :
                                                    'N/A'
                                                }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                ${workflow.total_cost || 0}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {workflow.last_run ?
                                                    new Date(workflow.last_run).toLocaleDateString() :
                                                    'Never'
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    )
}
