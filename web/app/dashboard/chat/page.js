// AI Chat Interface
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '../../../components/AuthGuard'
import { auth } from '../../../lib/auth'

export default function ChatPage() {
    const [user, setUser] = useState(null)
    const [messages, setMessages] = useState([])
    const [inputMessage, setInputMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const messagesEndRef = useRef(null)
    const router = useRouter()

    useEffect(() => {
        loadUser()
        // Add welcome message
        setMessages([
            {
                id: 1,
                type: 'assistant',
                content: 'Hello! I\'m Syntra, your AI assistant. I can help you with workflow automation, data analysis, and optimizing your business processes. How can I assist you today?',
                timestamp: new Date().toISOString()
            }
        ])
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const loadUser = async () => {
        try {
            const currentUser = await auth.getCurrentUser()
            if (!currentUser) {
                router.push('/login')
                return
            }
            setUser(currentUser)
        } catch (error) {
            console.error('Error loading user:', error)
            router.push('/login')
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

    const handleSendMessage = async (e) => {
        e.preventDefault()

        if (!inputMessage.trim() || loading) return

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputMessage,
            timestamp: new Date().toISOString()
        }

        setMessages(prev => [...prev, userMessage])
        setInputMessage('')
        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/agent/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: inputMessage,
                    context: {
                        user: user?.email,
                        timestamp: new Date().toISOString()
                    }
                }),
            })

            const data = await response.json()

            if (response.ok) {
                const assistantMessage = {
                    id: Date.now() + 1,
                    type: 'assistant',
                    content: data.response,
                    timestamp: new Date().toISOString()
                }
                setMessages(prev => [...prev, assistantMessage])
            } else {
                setError(data.error || 'Failed to get response')
            }
        } catch (error) {
            console.error('Chat error:', error)
            setError('Failed to send message')
        } finally {
            setLoading(false)
        }
    }

    const handleQuickAction = (action) => {
        const quickMessages = {
            'create_workflow': 'I want to create a new workflow. Can you help me set it up?',
            'analyze_data': 'I have some data I need analyzed. What can you help me with?',
            'notion_integration': 'How do I set up Notion integration for my workflows?',
            'workflow_help': 'I need help understanding how workflows work in Syntra.'
        }

        setInputMessage(quickMessages[action] || action)
    }

    return (
        <AuthGuard requireAuth={true}>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                {/* Header */}
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <h1 className="text-xl font-bold text-gray-900">AI Assistant</h1>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <a
                                    href="/dashboard"
                                    className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                                >
                                    ← Back to Dashboard
                                </a>
                                <div className="text-sm text-gray-700">
                                    {user?.email}
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

                {/* Chat Container */}
                <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.type === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-900 border border-gray-200'
                                        }`}
                                >
                                    <div className="text-sm">{message.content}</div>
                                    <div className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                                        }`}>
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white text-gray-900 border border-gray-200 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                        <span className="text-sm">Syntra is thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    <div className="px-4 py-2 border-t border-gray-200 bg-white">
                        <div className="flex flex-wrap gap-2 mb-2">
                            <span className="text-xs text-gray-500">Quick actions:</span>
                            {[
                                { key: 'create_workflow', label: 'Create Workflow' },
                                { key: 'analyze_data', label: 'Analyze Data' },
                                { key: 'notion_integration', label: 'Notion Setup' },
                                { key: 'workflow_help', label: 'Workflow Help' }
                            ].map((action) => (
                                <button
                                    key={action.key}
                                    onClick={() => handleQuickAction(action.key)}
                                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input Form */}
                    <div className="p-4 border-t border-gray-200 bg-white">
                        {error && (
                            <div className="mb-2 text-sm text-red-600">{error}</div>
                        )}
                        <form onSubmit={handleSendMessage} className="flex space-x-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Ask me anything about workflows, data analysis, or automation..."
                                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !inputMessage.trim()}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AuthGuard>
    )
}
