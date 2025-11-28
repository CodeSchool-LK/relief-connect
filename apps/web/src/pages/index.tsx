import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import SafetyBanner from '../components/SafetyBanner';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Sri Lanka Crisis Help</title>
        <meta name="description" content="Connect those in need with those who can help" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <SafetyBanner />
        
        <h1 className={styles.title}>Sri Lanka Crisis Help</h1>
        <p className={styles.subtitle}>Connect those in need with those who can help</p>

        <div className={styles.actionButtons}>
          <Link href="/need-help" className={styles.actionButton}>
            <div className={styles.buttonIcon}>🆘</div>
            <h2>I Need Help</h2>
            <p>Request assistance for food, medical, rescue, or shelter</p>
          </Link>

          <Link href="/camp" className={styles.actionButton}>
            <div className={styles.buttonIcon}>🏕️</div>
            <h2>We Are a Camp</h2>
            <p>Register your camp and share your needs</p>
          </Link>

          <Link href="/help" className={styles.actionButton}>
            <div className={styles.buttonIcon}>🗺️</div>
            <h2>I Can Help</h2>
            <p>View map and offer assistance to those in need</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
