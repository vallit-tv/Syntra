// Beautiful Dashboard page with modern design
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '../../components/AuthGuard'

export default function DashboardPage() {
    const [user, setUser] = useState(null)
    const [analytics, setAnalytics] = useState(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchUserData()
        fetchAnalytics()
    }, [])

    const fetchUserData = async () => {
        try {
            const response = await fetch('/api/auth/me')
            if (response.ok) {
                const userData = await response.json()
                setUser(userData.user)
            }
        } catch (error) {
            console.error('Error fetching user data:', error)
        }
    }

    const fetchAnalytics = async () => {
        try {
            const response = await fetch('/api/dashboard/analytics')
            if (response.ok) {
                const analyticsData = await response.json()
                setAnalytics(analyticsData)
            }
        } catch (error) {
            console.error('Error fetching analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSignOut = async () => {
        try {
            await fetch('/api/auth/signout', { method: 'POST' })
            router.push('/')
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <AuthGuard>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Dashboard
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Welcome back, <span className="font-semibold text-gray-900">{user?.user_metadata?.full_name || 'User'}</span>! 👋
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">
                                        {user?.user_metadata?.full_name?.charAt(0) || 'U'}
                                    </span>
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center">
                                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                                    <span className="text-2xl">🤖</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Active Workflows</p>
                                    <p className="text-3xl font-bold text-gray-900">{analytics?.activeWorkflows || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center">
                                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                                    <span className="text-2xl">✅</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Completed Runs</p>
                                    <p className="text-3xl font-bold text-gray-900">{analytics?.completedRuns || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center">
                                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                                    <span className="text-2xl">📊</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Data Points</p>
                                    <p className="text-3xl font-bold text-gray-900">{analytics?.dataPoints || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center">
                                <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                                    <span className="text-2xl">⚡</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Avg. Response Time</p>
                                    <p className="text-3xl font-bold text-gray-900">{analytics?.avgResponseTime || '0ms'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <a href="/dashboard/workflows" className="group bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center">
                                    <div className="text-3xl mb-2">🤖</div>
                                    <div className="font-semibold">Create Workflow</div>
                                </a>
                                <a href="/dashboard/analytics" className="group bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center">
                                    <div className="text-3xl mb-2">📊</div>
                                    <div className="font-semibold">Analytics</div>
                                </a>
                                <a href="/dashboard/integrations" className="group bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center">
                                    <div className="text-3xl mb-2">🔗</div>
                                    <div className="font-semibold">Integrations</div>
                                </a>
                                <a href="/dashboard/chat" className="group bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center">
                                    <div className="text-3xl mb-2">💬</div>
                                    <div className="font-semibold">AI Chat</div>
                                </a>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                            <div className="space-y-4">
                                {analytics?.recentActivity?.length > 0 ? (
                                    analytics.recentActivity.map((activity, index) => (
                                        <div key={index} className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-xl mr-4">
                                                {activity.icon}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{activity.title}</p>
                                                <p className="text-sm text-gray-600">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">📈</div>
                                        <p className="text-gray-500 text-lg">No recent activity</p>
                                        <p className="text-gray-400 text-sm">Start by creating your first workflow!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    )
}