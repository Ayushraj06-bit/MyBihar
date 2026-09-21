import type { Metadata } from 'next'
import { SectionHead } from '@/components/brand/SectionHead'
import { requireUser } from '@/lib/auth'

export const metadata: Metadata = { title: 'About the creator' }

const REPO = 'https://github.com/Ayushraj06-bit/MyBihar'

type Contributor = {
  login: string
  html_url: string
  avatar_url: string
  type: string
}

async function getContributors(): Promise<Contributor[]> {
  try {
    const res = await fetch(
      'https://api.github.com/repos/Ayushraj06-bit/MyBihar/contributors?per_page=100',
      { headers: { Accept: 'application/vnd.github+json' }, next: { revalidate: 3600 } },
    )
    if (!res.ok) return []
    const people = (await res.json()) as Contributor[]
    return people.filter((person) => person.type === 'User')
  } catch {
    return []
  }
}

export default async function AboutCreator() {
  await requireUser()
  const contributors = await getContributors()

  return (
    <main className="hb-page hb-page-top">
      <div className="hb-wrap">
        <SectionHead
          level={1}
          title="About the creator"
          lede="My Bihar is a community-built guide to the state — its places, its transport, its news and its markets, gathered in one place."
        />

        <div className="hb-measure" style={{ marginTop: 64, display: 'grid', gap: 48 }}>
          <section>
            <h2 className="hb-h3">Why it exists</h2>
            <p className="hb-body" style={{ marginTop: 12 }}>
              To make Bihar easier to find your way around, and more fun to wander — and to bring the
              state&apos;s useful resources together, so no one has to keep twelve tabs open to plan an
              evening in Patna or a weekend in Rajgir.
            </p>
          </section>
          <section>
            <h2 className="hb-h3">Built with love by Ayush Raj</h2>
            {contributors.length > 0 ? (
              <ul style={{ listStyle: 'none', margin: '20px 0 0', padding: 0, display: 'grid', gap: 12 }}>
                {contributors.map((person) => (
                  <li key={person.login}>
                    <a
                      href={person.html_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        color: 'var(--hb-pearl)',
                        textDecoration: 'none',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={person.avatar_url}
                        alt=""
                        width={40}
                        height={40}
                        style={{ borderRadius: '50%', background: 'var(--hb-slate)' }}
                      />
                      <span className="hb-body">{person.login}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="hb-body" style={{ marginTop: 12 }}>
                See the people on{' '}
                <a href={`${REPO}/graphs/contributors`} target="_blank" rel="noreferrer">
                  GitHub
                </a>
                .
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
