// Sign out API endpoint
import { NextResponse } from 'next/server'
import { auth } from '../../../../lib/auth'

export async function POST(request) {
    try {
        await auth.signOut()

        return NextResponse.json({
            message: 'Signed out successfully'
        })

    } catch (error) {
        console.error('Sign out error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to sign out' },
            { status: 500 }
        )
    }
}
