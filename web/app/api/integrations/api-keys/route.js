// API Keys management endpoint
import { NextResponse } from 'next/server'
import { auth } from '../../../../lib/auth'
import { db } from '../../../../lib/supabase'
import crypto from 'crypto'

// Simple encryption/decryption for API keys
const algorithm = 'aes-256-cbc'
const secretKey = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here'

function encrypt(text) {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(algorithm, secretKey)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return iv.toString('hex') + ':' + encrypted
}

function decrypt(encryptedText) {
    const textParts = encryptedText.split(':')
    const iv = Buffer.from(textParts.shift(), 'hex')
    const encrypted = textParts.join(':')
    const decipher = crypto.createDecipher(algorithm, secretKey)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
}

export async function GET(request) {
    try {
        // Check authentication
        const user = await auth.getCurrentUser()
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        // Get user's API keys
        const keys = await db.getApiKeys(user.id)

        return NextResponse.json({ keys })

    } catch (error) {
        console.error('Get API keys error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch API keys' },
            { status: 500 }
        )
    }
}

export async function POST(request) {
    try {
        // Check authentication
        const user = await auth.getCurrentUser()
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const { name, type, key } = await request.json()

        // Validate input
        if (!name || !type || !key) {
            return NextResponse.json(
                { error: 'Name, type, and key are required' },
                { status: 400 }
            )
        }

        // Encrypt the API key
        const encryptedKey = encrypt(key)

        // Create API key
        const apiKey = await db.createApiKey(user.id, {
            name,
            type,
            encrypted_key: encryptedKey,
            is_active: true
        })

        return NextResponse.json({
            key: {
                id: apiKey.id,
                name: apiKey.name,
                type: apiKey.type,
                is_active: apiKey.is_active,
                created_at: apiKey.created_at
            }
        })

    } catch (error) {
        console.error('Create API key error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create API key' },
            { status: 500 }
        )
    }
}
