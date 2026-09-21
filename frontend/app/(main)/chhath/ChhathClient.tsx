// @ts-nocheck
'use client'

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/brand/Card'
import { SectionHead } from '@/components/brand/SectionHead'
import { CountdownScene, ChhathDays } from '@/components/brand/Countdown'
import { AripanLoader, AripanRule } from '@/components/brand/Aripan'
import { CityIcon } from '@/components/brand/icons'
import styles from '@/styles/Chhath.module.css'

/* the big Patna ghats, measured from Gandhi Maidan */
const NEARBY_GHATS = [
  { name: 'Gandhi Ghat', distance: '1.4 km' },
  { name: 'Collectorate Ghat', distance: '1.9 km' },
  { name: 'Digha Ghat', distance: '7.5 km' },
]

const REGION_ORDER = ['Magadh', 'Mithila', 'Bhojpur', 'Anga']

function orderRegions(regions) {
  return REGION_ORDER
    .map((name) => regions.find((region) => region.name === name))
    .filter(Boolean)
}

function Chhath() {
  const [regions, setRegions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    /* aborted on unmount — and on React's dev-only second mount, so one request lands */
    const controller = new AbortController()
    async function fetchRegions() {
      try {
        setLoading(true)
        const res = await fetch('/api/regions', { signal: controller.signal })
        if (!res.ok) throw new Error('Failed to fetch regions')
        const data = await res.json()
        setRegions(data)
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    fetchRegions()
    return () => controller.abort()
  }, [])

  return (
    <main className="mk-page">
      {/* the homecoming — no crimson anywhere in this band. design.md §9.7 */}
      <section className={styles.scene} aria-labelledby="chhath-title">
        <h1 id="chhath-title" className="sr-only">Chhath Puja</h1>
        <CountdownScene />
        <div className="mk-wrap">
          <ChhathDays className={styles.days} />
        </div>
      </section>

      <AripanRule className="mk-wrap" />

      <section className="mk-band" aria-labelledby="regions-title">
        <div className="mk-wrap">
          <SectionHead
            id="regions-title"
            title="Where to go"
            lede="Magadh keeps the Ganga ghats, Mithila paints its courtyards, Bhojpur sings the loudest, and Anga has the river at its widest. Pick a side of the state."
          />
          {loading ? (
            <AripanLoader label="Finding the regions" className={styles.state} />
          ) : error ? (
            <div className={`mk-panel mk-empty ${styles.state}`} role="status">
              <h3 className="mk-h3">The regions didn&apos;t load.</h3>
              <p className="mk-body">Check your connection, then refresh the page.</p>
            </div>
          ) : regions.length ? (
            <div className={styles.regions}>
              {orderRegions(regions).map((region) => (
                <Card
                  key={region._id}
                  href={`/near-you?${new URLSearchParams({ view: 'grid', q: region.name })}`}
                  ariaLabel={`Explore ${region.name}`}
                  image={region.image}
                  icon="haveli"
                  title={region.name}
                  sub="Explore the region"
                  desc={region.description}
                />
              ))}
            </div>
          ) : (
            <p className={`mk-caption ${styles.state}`}>No regions listed yet. The ghats are still being swept.</p>
          )}
        </div>
      </section>

      <section className="mk-band" aria-labelledby="near-title" style={{ paddingTop: 0 }}>
        <div className="mk-wrap">
          <div className={styles.nearGrid}>
            <div>
              <SectionHead id="near-title" title="Ghats near you" lede="The closest ones first. Be there before sunset on Sandhya Arghya, and before four in the morning for Usha." />
              <ul className={styles.nearList}>
                {NEARBY_GHATS.map((ghat) => (
                  <li key={ghat.name} className={styles.nearItem}>
                    <span className={styles.nearName}>{ghat.name}</span>
                    <span className={styles.nearDistance}>
                      <CityIcon name="auto" size={20} />
                      {ghat.distance}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.mapFrame}>
              <iframe
                title="Map of Patna"
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d115128.2!2d85.0797!3d25.6093!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Chhath
