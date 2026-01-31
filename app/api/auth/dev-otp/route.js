import { NextResponse } from 'next/server'

// In-memory OTP store for development (not for production!)
// Format: { email: { otp: string, expiresAt: number, userData: object } }
const otpStore = new Map()

// Generate 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

// POST: Generate and store OTP
export async function POST(request) {
    try {
        const body = await request.json()
        const { email, userData = {} } = body

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            )
        }

        // Generate OTP
        const otp = generateOTP()
        const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

        // Store OTP
        otpStore.set(email.toLowerCase(), {
            otp,
            expiresAt,
            userData
        })

        // 🎯 LOG OTP TO TERMINAL
        console.log('\n')
        console.log('╔════════════════════════════════════════════════════════════╗')
        console.log('║                    📧 OTP GENERATED                        ║')
        console.log('╠════════════════════════════════════════════════════════════╣')
        console.log(`║  Email: ${email.padEnd(50)} ║`)
        console.log(`║  OTP:   ${otp.padEnd(50)} ║`)
        console.log(`║  Expires: ${new Date(expiresAt).toLocaleTimeString().padEnd(48)} ║`)
        console.log('╚════════════════════════════════════════════════════════════╝')
        console.log('\n')

        return NextResponse.json({
            success: true,
            message: 'OTP sent successfully (check terminal)',
            // In dev mode, we can optionally return the OTP
            ...(process.env.NODE_ENV === 'development' && { devOtp: otp })
        })

    } catch (err) {
        console.error('OTP generation error:', err)
        return NextResponse.json(
            { error: 'Failed to generate OTP', details: err.message },
            { status: 500 }
        )
    }
}

// GET: Verify OTP
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const email = searchParams.get('email')
        const otp = searchParams.get('otp')

        if (!email || !otp) {
            return NextResponse.json(
                { error: 'Email and OTP are required' },
                { status: 400 }
            )
        }

        const storedData = otpStore.get(email.toLowerCase())

        if (!storedData) {
            console.log(`❌ OTP verification failed - No OTP found for: ${email}`)
            return NextResponse.json(
                { valid: false, error: 'No OTP found for this email' },
                { status: 400 }
            )
        }

        // Check if expired
        if (Date.now() > storedData.expiresAt) {
            otpStore.delete(email.toLowerCase())
            console.log(`❌ OTP verification failed - OTP expired for: ${email}`)
            return NextResponse.json(
                { valid: false, error: 'OTP has expired' },
                { status: 400 }
            )
        }

        // Verify OTP
        if (storedData.otp !== otp) {
            console.log(`❌ OTP verification failed - Invalid OTP for: ${email} (expected: ${storedData.otp}, got: ${otp})`)
            return NextResponse.json(
                { valid: false, error: 'Invalid OTP' },
                { status: 400 }
            )
        }

        // Success - remove OTP from store
        const userData = storedData.userData
        otpStore.delete(email.toLowerCase())

        console.log(`✅ OTP verified successfully for: ${email}`)

        return NextResponse.json({
            valid: true,
            message: 'OTP verified successfully',
            userData
        })

    } catch (err) {
        console.error('OTP verification error:', err)
        return NextResponse.json(
            { error: 'Failed to verify OTP', details: err.message },
            { status: 500 }
        )
    }
}
