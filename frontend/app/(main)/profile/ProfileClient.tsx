'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { Sprig } from '@/components/brand/mithila'
import { Motif } from '@/components/brand/motifs'
import { AripanLoader } from '@/components/brand/Aripan'
import styles from '@/styles/Profile.module.css'

export default function Profile() {
  const { user, isLoaded, logout } = useAuth()
  const [now] = useState(() => Date.now())

  if (!isLoaded) {
    return <main className="hb-page hb-page-top hb-wrap"><AripanLoader label="Opening your profile" /></main>
  }

  const emailCount = user?.email ? 1 : 0
  const daysWithUs = user?.createdAt
    ? Math.floor((now - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <main className="hb-page hb-page-top">
      <div className="hb-wrap">
        <header className={styles.header}>
          <div className={styles.avatar}>
            {user?.imageUrl
              /* eslint-disable-next-line @next/next/no-img-element */
              ? <img src={user.imageUrl} alt={user.fullName ? `${user.fullName}'s profile photo` : 'Your profile photo'} referrerPolicy="no-referrer" />
              /* the rosette stands in for a face that hasn't been added yet */
              : <Motif name="rosette" height={72} />}
          </div>
          <div className={styles.identity}>
            <div className="hb-band-head">
              <Sprig size={40} />
              <h1 className="hb-h1">{user?.fullName || 'Your profile'}</h1>
            </div>
            <p className="hb-body-lg" style={{ color: 'var(--hb-ash)', marginTop: 8 }}>
              {user?.email || 'Bihar explorer'}
            </p>
            <div className={styles.tags}>
              {user?.emailVerified && <span className="hb-tag">Email verified</span>}
              <span className="hb-tag">Bihar explorer</span>
            </div>
          </div>
        </header>

        <dl className={styles.stats}>
          <div className={styles.stat}>
            <dt className="hb-meta">Days with us</dt>
            <dd className={styles.statValue}>{daysWithUs}</dd>
          </div>
          <div className={styles.stat}>
            <dt className="hb-meta">Ways to reach you</dt>
            <dd className={styles.statValue}>{emailCount}</dd>
          </div>
          <div className={styles.stat}>
            <dt className="hb-meta">Account</dt>
            <dd className={styles.statValue}>Active</dd>
          </div>
        </dl>

        <section className={styles.manage} aria-labelledby="manage-title">
          <h2 id="manage-title" className="hb-h2">Your account</h2>
          <p className="hb-body" style={{ color: 'var(--hb-ash)', marginTop: 12 }}>
            Your name and photo come from your Google account. Change them there.
          </p>
          <div className={styles.account}>
            <dl className={styles.accountRows}>
              <dt className="hb-meta">Signed in with</dt>
              <dd className="hb-body">Google</dd>
              {user?.email && (
                <>
                  <dt className="hb-meta">Email</dt>
                  <dd className="hb-body">{user.email}</dd>
                </>
              )}
            </dl>
            <button type="button" className="hb-btn hb-btn--secondary" onClick={() => void logout()}>Sign out</button>
          </div>
        </section>
      </div>
    </main>
  )
}
