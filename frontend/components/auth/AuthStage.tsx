import type { ReactNode } from 'react'
import { MedallionBloom } from '@/components/brand/MedallionBloom'
import { AripanLoader } from '@/components/brand/Aripan'

/*  The auth screens. The medallion needs a flat ground, so the photograph gets
    its own half of the frame and the mark sits on Obsidian beside it. Below
    900px the photograph becomes a short band above the form.                 */

export function AuthStage({ children, lede, footer }: { children: ReactNode; lede: string; footer?: ReactNode }) {
  return (
    <main className="mk-auth">
      <section className="mk-auth-main">
        <div className="mk-auth-column">
          <div className="mk-auth-lockup">
            <MedallionBloom size={88} />
            <div>
              <h1 className="mk-auth-latin">MY BIHAR</h1>
              <p className="mk-auth-hi" lang="hi">हमार बिहार</p>
            </div>
          </div>
          <p className="mk-body-lg mk-auth-lede">{lede}</p>
          {children}
        </div>
        {footer && <footer className="mk-meta mk-auth-credit">{footer}</footer>}
      </section>

      <figure className="mk-auth-photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/login-bg.jpg"
          alt="The Mahatma Gandhi Setu running out over the Ganga at Patna on a supermoon night"
        />
        <div className="mk-auth-scrim" aria-hidden="true" />
        <figcaption className="mk-capdev mk-auth-caption">
          <span className="mk-capdev-tick" aria-hidden="true" />
          <div>
            <p className="mk-capdev-1">The moon comes up over the river,</p>
            <p className="mk-capdev-2">and the Setu keeps its appointments.</p>
          </div>
        </figcaption>
      </figure>
    </main>
  )
}

export function AuthLoading({ label }: { label: string }) {
  return (
    <main className="mk-auth mk-auth--loading">
      <AripanLoader label={label} />
    </main>
  )
}
