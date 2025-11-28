import React, { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'apps/web/src/components/ui/card'
import { Button } from 'apps/web/src/components/ui/button'
import { Input } from 'apps/web/src/components/ui/input'
import { Label } from 'apps/web/src/components/ui/label'
import { ArrowLeft, User, Phone } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!phone.trim()) {
      setError('Please enter your phone number')
      return
    }

    setLoading(true)

    // Mock login - check if user exists in localStorage
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Check if user exists (in real app, this would call an API)
    const existingUsers = localStorage.getItem('donor_users')
    const users = existingUsers ? JSON.parse(existingUsers) : []
    
    const user = users.find((u: any) => u.phone === phone)
    
    if (!user) {
      setError('Phone number not found. Please register first.')
      setLoading(false)
      return
    }

    // Store logged in user info
    localStorage.setItem(
      'donor_user',
      JSON.stringify({
        name: user.name,
        phone: user.phone,
        loggedIn: true,
      })
    )

    setLoading(false)
    router.push('/requests')
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
                Enter your phone number to access the requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
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
