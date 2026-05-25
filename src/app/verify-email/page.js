'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const requestedTokenRef = useRef(null)
  const redirectTimeoutRef = useRef(null)

  const [hydrated, setHydrated] = useState(false)
  const [email, setEmail] = useState('')
  const [resendStatus, setResendStatus] = useState('')
  const [verificationStatus, setVerificationStatus] = useState({
    loading: true,
    success: false,
    message: ''
  })

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return

    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current)
      redirectTimeoutRef.current = null
    }

    if (!token || token.trim() === '') {
      setVerificationStatus({
        loading: false,
        success: false,
        message: 'Invalid or missing verification link.'
      })
      requestedTokenRef.current = null
      return
    }

    const cleanToken = token.trim()

    if (requestedTokenRef.current === cleanToken) {
      return
    }

    requestedTokenRef.current = cleanToken

    setVerificationStatus({
      loading: true,
      success: false,
      message: ''
    })

    let isCancelled = false

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `/api/verify-email?token=${encodeURIComponent(cleanToken)}`,
          {
            method: 'GET',
            cache: 'no-store'
          }
        )

        const data = await response.json()

        if (isCancelled) return

        if (data?.success === true) {
          const message =
            data?.message ||
            'Email verifie avec succes ! Vous pouvez maintenant vous connecter.'

          setVerificationStatus({
            loading: false,
            success: true,
            message
          })

          redirectTimeoutRef.current = setTimeout(() => {
            router.push('/login')
          }, 2000)

          return
        }

        setVerificationStatus({
          loading: false,
          success: false,
          message:
            data?.error ||
            'Verification failed. Please try again.'
        })
      } catch (error) {
        console.error('Verification error:', error)

        if (isCancelled) return

        setVerificationStatus({
          loading: false,
          success: false,
          message:
            'An error occurred during verification. Please try again.'
        })
      }
    }

    verifyEmail()

    return () => {
      isCancelled = true

      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
        redirectTimeoutRef.current = null
      }
    }
  }, [hydrated, token, router])

  const handleResendVerification = async () => {
    if (!email || email.trim() === '') {
      setResendStatus('Please enter your email address.')
      return
    }

    try {
      setResendStatus('Sending verification email...')

      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
        cache: 'no-store'
      })

      const data = await response.json()

      if (response.ok && data?.success === true) {
        setResendStatus('OK ' + data.message)
        setTimeout(() => setResendStatus(''), 3000)
      } else {
        setResendStatus(
          'ERROR ' + (data?.error || 'Could not send the verification email.')
        )
      }
    } catch (error) {
      console.error('Verification resend error:', error)
      setResendStatus('ERROR An error occurred. Please try again.')
    }
  }

  if (!hydrated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url('/bg.png')` }}
      >
        <div className="w-full max-w-md bg-black/80 backdrop-blur-sm p-6 rounded-lg flex flex-col items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url('/bg.png')` }}
    >
      <div className="w-full max-w-md bg-black/80 backdrop-blur-sm p-6 rounded-lg">
        <h1 className="text-2xl text-yellow-400 font-bold text-center mb-4">
          Email verification
        </h1>

        {verificationStatus.loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
          </div>
        ) : verificationStatus.success ? (
          <div className="text-center">
            <div className="text-green-400 text-6xl mb-3">OK</div>
            <h2 className="text-xl text-green-400 font-semibold mb-2">
              Verification successful!
            </h2>
            <p className="text-gray-300">{verificationStatus.message}</p>
            <p className="text-gray-400 mt-2 text-sm">
              Redirecting to the login page...
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-[#ff6b6b] text-6xl mb-3">ERROR</div>
            <h2 className="text-xl text-[#ff6b6b] font-semibold mb-2">
              Verification failed
            </h2>
            <p className="text-gray-300 mb-6">
              {verificationStatus.message}
            </p>

            <div className="space-y-4">
              <h3 className="text-yellow-400 font-semibold">
                Need a new verification link?
              </h3>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-2.5 bg-black/50 border border-gray-700 rounded text-white placeholder-gray-500"
              />

              <button
                onClick={handleResendVerification}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!email.trim()}
              >
                Resend verification email
              </button>

              {resendStatus && (
                <p
                  className={`text-sm mt-2 ${
                    resendStatus.startsWith('OK')
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                >
                  {resendStatus}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}