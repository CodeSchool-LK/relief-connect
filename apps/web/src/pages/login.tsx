import React, { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, User, Lock } from 'lucide-react'
import apiClient from '../services/api-client'
import { useAuth } from '../hooks/useAuth'
import { UserRole } from '../types/user'

export default function LoginPage() {
  const router = useRouter()
  const { login: authLogin } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const trimmedUsername = username.trim()
    if (!trimmedUsername) {
      setError('Please enter your username, email, or phone number')
      return
    }

    if (trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters long')
      return
    }

    setLoading(true)

    try {
      console.log('Logging in with username:', trimmedUsername)

      // Call the login API
      const response = await apiClient.post<{
        success: boolean
        data?: {
          user: {
            id: number
            username: string
            role: string
            status: string
            createdAt: string
            updatedAt: string
          }
          accessToken: string
          refreshToken: string
        }
        message?: string
        error?: string
        details?: Array<{
          field: string
          constraints: Record<string, string>
        }>
      }>(
        '/api/auth/login',
        {
          username: trimmedUsername,
          ...(password.trim() && { password: password.trim() }),
        },
        true
      )

      console.log('Login response:', response)

      if (response.success && response.data) {
        // Update auth context - cast role to UserRole type
        authLogin(response.data.accessToken, response.data.refreshToken, {
          ...response.data.user,
          role: response.data.user.role as UserRole,
        })

        setLoading(false)

        // Redirect based on user role
        const userRole = response.data.user.role
        if (userRole === 'ADMIN' || userRole === 'SYSTEM_ADMINISTRATOR') {
          router.push('/admin/dashboard')
        } else if (userRole === 'VOLUNTEER_CLUB') {
          router.push('/clubs/dashboard')
        } else {
          router.push('/')
        }
      } else {
        // Handle validation errors
        let errorMessage = response.error || 'Login failed. Please try again.'
        if (response.details && Array.isArray(response.details) && response.details.length > 0) {
          const firstError = response.details[0]
          const constraintMessages = Object.values(firstError.constraints || {})
          if (constraintMessages.length > 0) {
            errorMessage = constraintMessages[0]
          }
        }
        setError(errorMessage)
        setLoading(false)
      }
    } catch (err) {
      console.error('Login error:', err)

      // Try to extract error details from the error
      let errorMessage = 'Failed to login. Please check your connection and try again.'

      if (err instanceof Error) {
        errorMessage = err.message

        // Check if it's a validation error with details
        const errorObj = err as Error & { details?: unknown }
        if (errorObj.details) {
          try {
            const details = Array.isArray(errorObj.details) ? errorObj.details : [errorObj.details]
            if (details.length > 0) {
              const firstDetail = details[0] as {
                field?: string
                constraints?: Record<string, string>
              }
              if (firstDetail?.constraints) {
                const constraintMessages = Object.values(firstDetail.constraints)
                if (constraintMessages.length > 0) {
                  errorMessage = constraintMessages[0]
                }
              }
            }
          } catch (parseErr) {
            // If parsing fails, use the original error message
            console.error('Error parsing error details:', parseErr)
          }
        }
      }

      setError(errorMessage)
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Login as Volunteer - Sri Lanka Crisis Help</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div
        className="min-h-screen flex items-center justify-center p-4 relative"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMCA0djJoLTJ2LTJoMnptLTQtNHYyaC0ydi0yaDJ6bTAgNHYyaC0ydi0yaDJ6bTQtNHYyaC0ydi0yaDJ6bTAgNHYyaC0ydi0yaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>

        <div className="w-full max-w-md relative z-10">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-4 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          <Card className="bg-white/10 backdrop-blur-md border-white/30 shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="RebuildSL Logo"
                  className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 object-contain drop-shadow-lg"
                  style={{
                    imageRendering: 'auto' as const,
                    maxWidth: '100%',
                    height: 'auto',
                  }}
                />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Login as Volunteer</CardTitle>
              <CardDescription className="text-base mt-2 text-white/90">
                Enter your username, email, or phone number to login
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">
                    Username, Email, or Phone
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-yellow-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username, email, or phone"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value)
                        setError(null)
                      }}
                      className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                      required
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-yellow-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password if you have one"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setError(null)
                      }}
                      className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-white/70">
                    If you registered without a password, leave this empty
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-300/50 text-white px-4 py-3 rounded-md text-sm backdrop-blur-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login as Volunteer'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  }
}
