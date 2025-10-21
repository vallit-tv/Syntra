// Beautiful simplified login page - name only
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '../../components/AuthGuard'

export default function LoginPage() {
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: name.trim() }),
            })

            const data = await response.json()

            if (response.ok) {
                // Redirect to dashboard or intended page
                const urlParams = new URLSearchParams(window.location.search)
                const redirectTo = urlParams.get('redirectTo') || '/dashboard'
                router.push(redirectTo)
            } else {
                setError(data.error || 'Login failed')
            }
        } catch (error) {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateAccount = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: name.trim() }),
            })

            const data = await response.json()

            if (response.ok) {
                // Auto sign in after creating account
                await handleSubmit(e)
            } else {
                setError(data.error || 'Failed to create account')
            }
        } catch (error) {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthGuard requireAuth={false}>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    {/* Header */}
                    <div className="text-center">
                        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                            <span className="text-3xl">🤖</span>
                        </div>
                        <h2 className="mt-6 text-center text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Welcome to Syntra
                        </h2>
                        <p className="mt-2 text-center text-lg text-gray-600">
                            AI-Powered Workflow Automation
                        </p>
                        <p className="mt-1 text-center text-sm text-gray-500">
                            Enter your name to get started
                        </p>
                    </div>

                    {/* Form */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                        <form className="space-y-6" onSubmit={isCreating ? handleCreateAccount : handleSubmit}>
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                                    <span className="text-red-500 mr-2">⚠️</span>
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Your Name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                                    placeholder="Enter your name"
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={loading || !name.trim()}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    {loading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            {isCreating ? 'Creating Account...' : 'Signing In...'}
                                        </div>
                                    ) : (
                                        isCreating ? 'Create Account' : 'Sign In'
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsCreating(!isCreating)}
                                    disabled={loading}
                                    className="w-full text-center py-2 px-4 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors duration-200"
                                >
                                    {isCreating ? 'Already have an account? Sign in' : 'Need an account? Create one'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Features */}
                    <div className="text-center">
                        <div className="grid grid-cols-3 gap-4 text-xs text-gray-500">
                            <div className="flex flex-col items-center">
                                <span className="text-lg mb-1">⚡</span>
                                <span>Fast Setup</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-lg mb-1">🔒</span>
                                <span>Secure</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-lg mb-1">🤖</span>
                                <span>AI Powered</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    )
}
