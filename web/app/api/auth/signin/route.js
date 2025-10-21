// Sign in API endpoint
import { NextResponse } from 'next/server'
import { auth, validation } from '../../../../lib/auth'

export async function POST(request) {
    try {
        const { email, password } = await request.json()

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        if (!validation.email(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            )
        }

        // Sign in user
        const result = await auth.signIn(email, password)

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
