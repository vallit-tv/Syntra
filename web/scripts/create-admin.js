// Script to create admin account for Theo
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdminAccount() {
    try {
        console.log('Creating admin account for Theo...')

        // Create user in auth.users
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: 'theo@syntra.local',
            password: 'admin123', // Temporary password
            email_confirm: true,
            user_metadata: {
                full_name: 'Theo',
                role: 'admin'
            }
        })

        if (authError) {
            console.error('Error creating auth user:', authError)
            return
        }

        console.log('Auth user created:', authData.user.id)

        // Create profile in profiles table
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: authData.user.id,
                email: 'theo@syntra.local',
                full_name: 'Theo',
                role: 'admin',
                subscription_tier: 'admin'
            })
            .select()
            .single()

        if (profileError) {
            console.error('Error creating profile:', profileError)
            return
        }

        console.log('Profile created:', profileData)
        console.log('✅ Admin account created successfully!')
        console.log('Login details:')
        console.log('- Name: Theo')
        console.log('- Email: theo@syntra.local')
        console.log('- Password: admin123 (temporary)')

    } catch (error) {
        console.error('Error creating admin account:', error)
    }
}

createAdminAccount()
