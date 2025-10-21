// Sign up API endpoint (simplified - name only)
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

        // Create user account
        const result = await auth.signUp(name.trim())

        return NextResponse.json({
            message: 'Account created successfully!',
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
