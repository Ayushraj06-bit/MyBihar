// @ts-nocheck
'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/brand/Card'
import { AripanLoader } from '@/components/brand/Aripan'
import { UiIcon } from '@/components/brand/icons'

function Explore() {
  const [searchTerm, setSearchTerm] = useState('')
  const [ghats, setGhats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchGhats() {
      try {
        setLoading(true)
        const res = await fetch('/api/ghats')
        if (!res.ok) throw new Error('Failed to fetch ghats')
        const data = await res.json()
        setGhats(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchGhats()
  }, [])

  if (loading) return <div className="mk-page mk-page-top mk-wrap"><AripanLoader label="Finding ghats" /></div>
  if (error) {
    return (
      <div className="mk-page mk-page-top mk-wrap">
        <div className="mk-panel mk-empty" role="status" style={{ maxWidth: 640 }}>
          <h2 className="mk-h3">The ghats didn&apos;t load.</h2>
          <p className="mk-body">Check your connection, then refresh the page.</p>
        </div>
      </div>
    )
  }

  const filteredGhats = ghats.filter(ghat =>
    ghat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ghat.location && ghat.location.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="mk-page mk-page-top mk-wrap">
      <label className="mk-line" style={{ maxWidth: 640 }}>
        <span className="sr-only">Search ghats</span>
        <UiIcon name="search" size={20} />
        <input
          type="search"
          placeholder="Search a ghat or a mohalla"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </label>

      <div className="mk-grid" style={{ marginTop: 48 }}>
        {filteredGhats.map(ghat => (
          <Card
            key={ghat._id}
            image={ghat.image}
            imageAlt=""
            icon="haveli"
            title={ghat.name}
            sub={[ghat.location, ghat.distance].filter(Boolean).join(', ')}
            desc={ghat.rating ? `Rated ${ghat.rating}. ${ghat.description ?? ''}` : ghat.description}
          />
        ))}
      </div>
    </div>
  )
}

export default Explore
