import Link from 'next/link'
import { Medallion } from '@/components/brand/mithila'

export default function NotFound() {
  return (
    <main className="hb-page hb-page-top">
      <div className="hb-wrap">
        <Medallion size={112} />
        <h1 className="hb-display" style={{ marginTop: 24 }}>This gali doesn&apos;t go anywhere.</h1>
        <p className="hb-lede">The page may have moved, or the address has a typo. Start again from the ghat.</p>
        <div className="hb-banner-actions">
          <Link href="/home" className="hb-btn hb-btn--primary">
            Back to Bihar <span className="hb-btn-arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
