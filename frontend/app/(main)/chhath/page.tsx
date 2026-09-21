import type { Metadata } from 'next'
import { requireUser } from '@/lib/auth'
import ChhathClient from './ChhathClient'

export const metadata: Metadata = { title: 'Chhath' }

export default async function ChhathPage() {
  await requireUser()
  return <ChhathClient />
}
