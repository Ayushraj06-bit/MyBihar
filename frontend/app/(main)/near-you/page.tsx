import { Suspense } from 'react'
import type { Metadata } from 'next'
import { requireUser } from '@/lib/auth'
import NearYouClient from './NearYouClient'
import { AripanLoader } from '@/components/brand/Aripan'

export const metadata: Metadata = {
  title: 'Near You',
  description: 'Cafés, food, culture and places on a live map of Bihar.',
}

export default async function NearYouPage() {
  await requireUser()

  return (
    <Suspense fallback={<div className="hb-page hb-page-top hb-wrap"><AripanLoader label="Opening the map" /></div>}>
      <NearYouClient />
    </Suspense>
  )
}
