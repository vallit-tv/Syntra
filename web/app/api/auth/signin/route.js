// Sign in API endpoint (simplified - name only)
import { NextResponse } from 'next/server'
import { auth, validation } from '../../../../lib/auth'

export async function POST(request) {
    try {
        const { name } = await request.json()

        // Validate input
        if (!name || name.trim().length === 0) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            )
        }

        if (!validation.fullName(name)) {
            return NextResponse.json(
                { error: 'Name must be at least 2 characters long' },
                { status: 400 }
            )
        }

        // Sign in user (or create if doesn't exist)
        const result = await auth.signIn(name.trim())

        return NextResponse.json({
            message: 'Signed in successfully',
            user: result.user,
            session: result.session
        })

    } catch (error) {
        console.error('Sign in error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to sign in' },
            { status: 401 }
        )
    }
}
