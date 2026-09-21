import type { Metadata } from 'next'
import GhatStill from '@/components/brand/Ghat'

export const metadata: Metadata = {
  title: 'The ghat',
  description: 'Sandhya Arghya, drawn: the sun going down over the Ganga.',
}

export default function Page() {
  return <GhatStill />
}
