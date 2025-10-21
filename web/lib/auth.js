// Authentication utilities and helpers
import { supabase } from './supabase'

export const auth = {
    // Sign up with name only (simplified)
    async signUp(fullName) {
        try {
            // Generate a unique email based on name
            const email = `${fullName.toLowerCase().replace(/\s+/g, '')}@syntra.local`

            // Generate a random password (user won't need to know it)
            const password = Math.random().toString(36).slice(-12)

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName
                    }
                }
            })

            if (error) throw error
            return data
        } catch (error) {
            console.error('Sign up error:', error)
            throw new Error(error.message || 'Failed to sign up')
        }
    },

    // Sign in with name only (simplified)
    async signIn(fullName) {
        try {
            // Generate email from name
            const email = `${fullName.toLowerCase().replace(/\s+/g, '')}@syntra.local`

            // For now, we'll use a simple approach - in production you'd want more security
            // This is a simplified version for demo purposes
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password: 'default123' // Default password for all users
            })

            if (error) {
                // If user doesn't exist, create them automatically
                if (error.message.includes('Invalid login credentials')) {
                    return await this.signUp(fullName)
                }
                throw error
            }
            return data
        } catch (error) {
            console.error('Sign in error:', error)
            throw new Error(error.message || 'Failed to sign in')
        }
    },

    // Sign out
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
        } catch (error) {
            console.error('Sign out error:', error)
            throw new Error('Failed to sign out')
        }
    },

    // Get current user
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser()
            if (error) throw error
            return user
        } catch (error) {
            console.error('Get user error:', error)
            return null
        }
    },

    // Get current session
    async getCurrentSession() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession()
            if (error) throw error
            return session
        } catch (error) {
            console.error('Get session error:', error)
            return null
        }
    },

    // Reset password
    async resetPassword(email) {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`
            })

            if (error) throw error
        } catch (error) {
            console.error('Reset password error:', error)
            throw new Error('Failed to send reset email')
        }
    },

    // Update password
    async updatePassword(newPassword) {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (error) throw error
        } catch (error) {
            console.error('Update password error:', error)
            throw new Error('Failed to update password')
        }
    },

    // Check if user is authenticated
    async isAuthenticated() {
        const session = await this.getCurrentSession()
        return !!session
    },

    // Get user profile
    async getUserProfile() {
        try {
            const user = await this.getCurrentUser()
            if (!user) return null

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error) throw error
            return data
        } catch (error) {
            console.error('Get profile error:', error)
            return null
        }
    },

    // Update user profile
    async updateProfile(updates) {
        try {
            const user = await this.getCurrentUser()
            if (!user) throw new Error('Not authenticated')

            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id)
                .select()
                .single()

            if (error) throw error
            return data
        } catch (error) {
            console.error('Update profile error:', error)
            throw new Error('Failed to update profile')
        }
    }
}

// Auth state management
export class AuthState {
    constructor() {
        this.user = null
        this.profile = null
        this.loading = true
        this.listeners = []
    }

    // Subscribe to auth state changes
    subscribe(callback) {
        this.listeners.push(callback)
        return () => {
            this.listeners = this.listeners.filter(listener => listener !== callback)
        }
    }

    // Notify all listeners of state changes
    notify() {
        this.listeners.forEach(listener => listener({
            user: this.user,
            profile: this.profile,
            loading: this.loading
        }))
    }

    // Update state
    updateState(user, profile, loading = false) {
        this.user = user
        this.profile = profile
        this.loading = loading
        this.notify()
    }

    // Initialize auth state
    async init() {
        try {
            this.loading = true
            this.notify()

            const session = await auth.getCurrentSession()
            if (session?.user) {
                const profile = await auth.getUserProfile()
                this.updateState(session.user, profile, false)
            } else {
                this.updateState(null, null, false)
            }

            // Listen for auth changes
            supabase.auth.onAuthStateChange(async (event, session) => {
                if (session?.user) {
                    const profile = await auth.getUserProfile()
                    this.updateState(session.user, profile, false)
                } else {
                    this.updateState(null, null, false)
                }
            })
        } catch (error) {
            console.error('Auth init error:', error)
            this.updateState(null, null, false)
        }
    }
}

// Create global auth state instance
export const authState = new AuthState()

// Validation helpers
export const validation = {
    email: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    },

    password: (password) => {
        return password.length >= 8
    },

    fullName: (name) => {
        return name.trim().length >= 2
    }
}

export default auth
