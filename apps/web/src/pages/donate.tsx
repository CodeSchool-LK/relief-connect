import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'
import DonationInteractionModal from '../components/DonationInteractionModal'
import { HelpRequestWithOwnershipResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/help-request/response/help_request_with_ownership_response_dto'
import { helpRequestService } from '../services'

export default function DonatePage() {
  const router = useRouter()
  const { requestId } = router.query
  const [helpRequest, setHelpRequest] = useState<HelpRequestWithOwnershipResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | undefined>(undefined)
  const [showModal, setShowModal] = useState(true)

  // Get current user ID from API if authenticated (for donation modal)
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        if (typeof window !== 'undefined') {
          const accessToken = localStorage.getItem('accessToken')
          if (accessToken) {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/users/me`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            })
            if (response.ok) {
              const data = await response.json()
              if (data.success && data.data && data.data.id) {
                setCurrentUserId(data.data.id)
              }
            }
          }
        }
      } catch (error) {
        console.error('[DonatePage] Error getting current user:', error)
      }
    }
    getCurrentUser()
  }, [])

  // Load help request by ID
  useEffect(() => {
    const loadHelpRequest = async () => {
      if (!requestId) {
        setError('Request ID is required')
        setLoading(false)
        return
      }

      const id = Number(requestId)
      if (isNaN(id)) {
        setError('Invalid request ID')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const response = await helpRequestService.getHelpRequestById(id)
        if (response.success && response.data) {
          setHelpRequest(response.data)
        } else {
          setError(response.error || 'Help request not found')
        }
      } catch (err) {
        console.error('[DonatePage] Error loading help request:', err)
        setError(err instanceof Error ? err.message : 'Failed to load help request')
      } finally {
        setLoading(false)
      }
    }

    loadHelpRequest()
  }, [requestId])

  if (loading) {
    return (
      <>
        <Head>
          <title>Make a Donation - Sri Lanka Crisis Help</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 mx-auto mb-4 text-blue-600 animate-spin" />
            <p className="text-gray-600">Loading help request...</p>
          </div>
        </div>
      </>
    )
  }

  if (error || !helpRequest) {
    return (
      <>
        <Head>
          <title>Make a Donation - Sri Lanka Crisis Help</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
                <p className="text-gray-600 mb-6">{error || 'Help request not found'}</p>
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" onClick={() => router.push('/')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Requests
                  </Button>
                  <Button onClick={() => router.push('/')}>
                    Go to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Make a Donation - Sri Lanka Crisis Help</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.push('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Requests
            </Button>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Make a Donation</h1>
                <p className="text-gray-600">
                  Help request from {helpRequest.approxArea || 'Unknown location'}
                </p>
              </div>
              <div className="text-center">
                <Button onClick={() => setShowModal(true)} size="lg">
                  Open Donation Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {helpRequest && (
        <DonationInteractionModal
          helpRequest={helpRequest}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            router.push('/')
          }}
          currentUserId={currentUserId}
          isOwner={helpRequest.isOwner}
        />
      )}
    </>
  )
}

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
}
