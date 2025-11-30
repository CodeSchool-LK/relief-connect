import React, { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, User } from 'lucide-react'
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
      }>('/api/auth/login', { 
        username: trimmedUsername,
        ...(password.trim() && { password: password.trim() })
      }, true)

      console.log('Login response:', response)

      if (response.success && response.data) {
        // Update auth context - cast role to UserRole type
        authLogin(
          response.data.accessToken,
          response.data.refreshToken,
          {
            ...response.data.user,
            role: response.data.user.role as UserRole,
          }
        )
        
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
        <title>Login as Donor - Sri Lanka Crisis Help</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <User className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold">Login as Donor</CardTitle>
              <CardDescription className="text-base mt-2">
                Enter your username, email, or phone number to login
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username, Email, or Phone</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username, email, or phone"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value)
                        setError(null)
                      }}
                      className="pl-10"
                      required
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password (Optional)</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password if you have one"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError(null)
                    }}
                    className="pl-10"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500">
                    If you registered without a password, leave this empty
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login as Donor'}
                </Button>

                <div className="text-center text-sm text-gray-500">
                  <p>Don&apos;t have an account?</p>
                  <Button
                    variant="link"
                    className="text-primary p-0 h-auto"
                    onClick={() => router.push('/register')}
                  >
                    Register as Donor
                  </Button>
                </div>
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
