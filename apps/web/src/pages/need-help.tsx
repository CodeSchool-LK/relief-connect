import React from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import EmergencyRequestForm from '../components/EmergencyRequestForm'
import { ICreateHelpRequest } from '@nx-mono-repo-deployment-test/shared/src/interfaces/help-request/ICreateHelpRequest'
import { helpRequestService } from '../services'
import { HelpRequestResponseDto } from '@nx-mono-repo-deployment-test/shared/src/dtos/help-request/response/help_request_response_dto'

export default function NeedHelp() {
  const router = useRouter()

  const handleSubmit = async (data: ICreateHelpRequest) => {
    // Store in localStorage to add to requests section
    if (typeof window !== 'undefined') {
      const existingRequests: HelpRequestResponseDto[] = JSON.parse(
        localStorage.getItem('help_requests') || '[]'
      )
      const newRequest: HelpRequestResponseDto = {
        ...data,
        id: Date.now(), // Generate a temporary ID
        createdAt: new Date(),
      }
      existingRequests.push(newRequest)
      localStorage.setItem('help_requests', JSON.stringify(existingRequests))
    }
    
    const response = await helpRequestService.createHelpRequest(data)
    return response
  }

  return (
    <>
      <Head>
        <title>I Need Help - Sri Lanka Crisis Help</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <EmergencyRequestForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/')}
        isGroup={false}
      />
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

