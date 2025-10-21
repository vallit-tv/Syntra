// Authentication guard component
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '../lib/auth'

export default function AuthGuard({ children, requireAuth = true }) {
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState(null)
    const router = useRouter()

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const isAuthenticated = await auth.isAuthenticated()
            const currentUser = await auth.getCurrentUser()

            setUser(currentUser)

            if (requireAuth && !isAuthenticated) {
                router.push('/login')
                return
            }

            if (!requireAuth && isAuthenticated) {
                router.push('/dashboard')
                return
            }
        } catch (error) {
            console.error('Auth check error:', error)
            if (requireAuth) {
                router.push('/login')
            }
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    if (requireAuth && !user) {
        return null // Will redirect to login
    }

    if (!requireAuth && user) {
        return null // Will redirect to dashboard
    }

    return children
}
