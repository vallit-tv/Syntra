// Sign up API endpoint
import { NextResponse } from 'next/server'
import { auth, validation } from '../../../../lib/auth'

export async function POST(request) {
    try {
        const { email, password, fullName } = await request.json()

        // Validate input
        if (!email || !password || !fullName) {
            return NextResponse.json(
                { error: 'Email, password, and full name are required' },
                { status: 400 }
            )
        }

        if (!validation.email(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            )
        }

        if (!validation.password(password)) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters long' },
                { status: 400 }
            )
        }

        if (!validation.fullName(fullName)) {
            return NextResponse.json(
                { error: 'Full name must be at least 2 characters long' },
                { status: 400 }
            )
        }

        // Create user account
        const result = await auth.signUp(email, password, fullName)

        return NextResponse.json({
            message: 'Account created successfully. Please check your email to verify your account.',
            user: result.user
        })

    } catch (error) {
        console.error('Sign up error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create account' },
            { status: 500 }
        )
    }
}
