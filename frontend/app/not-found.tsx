import Link from 'next/link'
import { Medallion } from '@/components/brand/mithila'

export default function NotFound() {
  return (
    <main className="mk-page mk-page-top">
      <div className="mk-wrap">
        <Medallion size={112} />
        <h1 className="mk-display" style={{ marginTop: 24 }}>This gali doesn&apos;t go anywhere.</h1>
        <p className="mk-lede">The page may have moved, or the address has a typo. Start again from the ghat.</p>
        <div className="mk-banner-actions">
          <Link href="/home" className="mk-btn mk-btn--primary">
            Back to Bihar <span className="mk-btn-arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
