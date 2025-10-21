// Individual API key management endpoint
import { NextResponse } from 'next/server'
import { auth } from '../../../../../lib/auth'
import { db } from '../../../../../lib/supabase'

export async function PUT(request, { params }) {
    try {
        // Check authentication
        const user = await auth.getCurrentUser()
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const { id } = params
        const updates = await request.json()

        // Update API key
        const apiKey = await db.updateApiKey(id, user.id, updates)

        return NextResponse.json({
            key: {
                id: apiKey.id,
                name: apiKey.name,
                type: apiKey.type,
                is_active: apiKey.is_active,
                last_used_at: apiKey.last_used_at,
                created_at: apiKey.created_at
            }
        })

    } catch (error) {
        console.error('Update API key error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to update API key' },
            { status: 500 }
        )
    }
}

export async function DELETE(request, { params }) {
    try {
        // Check authentication
        const user = await auth.getCurrentUser()
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const { id } = params

        // Delete API key
        await db.deleteApiKey(id, user.id)

        return NextResponse.json({ message: 'API key deleted successfully' })

    } catch (error) {
        console.error('Delete API key error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to delete API key' },
            { status: 500 }
        )
    }
}
