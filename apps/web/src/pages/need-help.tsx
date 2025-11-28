import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import HelpRequestForm from '../components/HelpRequestForm';
import SafetyBanner from '../components/SafetyBanner';
import { ICreateHelpRequest } from '@nx-mono-repo-deployment-test/shared/src/interfaces/help-request/ICreateHelpRequest';
import { helpRequestService } from '../services';
import styles from '../styles/Page.module.css';

export default function NeedHelp() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (data: ICreateHelpRequest) => {
    const response = await helpRequestService.createHelpRequest(data);
    if (response.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } else {
      throw new Error(response.error || 'Failed to submit help request');
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <Head>
          <title>Help Request Submitted - Sri Lanka Crisis Help</title>
        </Head>
        <main className={styles.main}>
          <div className={styles.successMessage}>
            <h2>✅ Help Request Submitted Successfully!</h2>
            <p>Your request has been posted and will be visible on the map.</p>
            <p>Redirecting to home page...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>I Need Help - Sri Lanka Crisis Help</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className={styles.main}>
        <SafetyBanner />
        <div className={styles.pageContent}>
          <HelpRequestForm onSubmit={handleSubmit} onCancel={() => router.push('/')} />
        </div>
      </main>
    </div>
  );
}

