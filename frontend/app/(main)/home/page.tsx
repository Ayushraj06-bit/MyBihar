import Link from 'next/link'
import type { Metadata } from 'next'
import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { listCatalogue } from '@/lib/catalogue/list'
import { getHomeNews, homeNewsCards } from '@/lib/news/home'
import { newsRepository } from '@/lib/news/server'
import { Card } from '@/components/brand/Card'
import { SectionHead } from '@/components/brand/SectionHead'
import { Medallion, Sprig } from '@/components/brand/mithila'
import { MithilaBorder } from '@/components/brand/Aripan'
import { HomeEntry } from '@/components/brand/HomeEntry'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Home' }

type MarketItem = {
  id: string
  _id?: string
  title: string
  location?: string | null
  price?: string | null
  image?: string | null
  link?: string | null
}

export default async function HomePage() {
  await requireUser()

  /* the paper, the city story, the sports story — persisted, never blank */
  const newsPromise = getHomeNews(newsRepository)
  let marketplace: MarketItem[] = []
  let failed = false

  try {
    marketplace = (await listCatalogue(prisma.marketplaceItem, 'marketplace', 20)) as MarketItem[]
  } catch (err) {
    console.error(err)
    failed = true
  }
  const news = homeNewsCards(await newsPromise)

  return (
    <>
      <HomeEntry />
      <main className="hb-page" style={{ paddingBottom: 0 }}>
      <section className="hb-banner" aria-labelledby="home-title">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="hb-banner-img"
          src="/hero-bg.jpg"
          alt="The Ganga at blue hour from Gandhi Ghat, the spans of the JP Setu running out across the water"
          style={{ objectPosition: '50% 58%' }}
        />
        <div className="hb-banner-scrim" aria-hidden="true" />
        <div className="hb-banner-content">
          <div className="hb-banner-copy">
            <Sprig size={38} />
            <h1 id="home-title" className="hb-display" style={{ marginTop: 8 }}>The state, this week.</h1>
            <p className="hb-banner-hi" lang="hi">चलीं, तनी घूम आईं।</p>
            <p className="hb-banner-lede">
              What the mohallas are talking about, what is for sale down the gali, and every place
              worth the walk — from the ghats of Patna to the ruins of Nalanda.
            </p>
            <div className="hb-banner-actions">
              <Link href="/places" className="hb-btn hb-btn--primary">
                Explore Bihar <span className="hb-btn-arrow" aria-hidden="true">→</span>
              </Link>
              <Link href="/chhath" className="hb-btn hb-btn--secondary">Count down to Chhath</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="hb-band" aria-labelledby="news-title">
        <div className="hb-wrap">
          <SectionHead id="news-title" title="In the news" lede="Papers, melas and fixtures the state is following." />
          <div className="hb-row" style={{ marginTop: 48 }}>
            {news.length ? news.map((item) => (
              <Card
                key={item.id}
                href={item.link || undefined}
                external
                image={item.image}
                title={item.title}
                desc={item.type === 'NEWSPAPER' ? item.description : undefined}
                icon="book"
                ariaLabel={item.link ? `${item.title}, opens in a new tab` : undefined}
              />
            )) : (
              <p className="hb-caption">Nothing in the news yet. Check back this evening.</p>
            )}
          </div>
        </div>
      </section>

      {failed ? (
        <section className="hb-band" style={{ paddingTop: 0 }}>
          <div className="hb-wrap">
            <div className="hb-panel hb-empty" role="status">
              <h2 className="hb-h3">The market didn&apos;t load.</h2>
              <p className="hb-body">The connection to our listings dropped. Refresh the page to try again.</p>
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="hb-band" aria-labelledby="market-title" style={{ paddingTop: 0 }}>
            <div className="hb-wrap">
              <SectionHead id="market-title" title="Marketplace" lede="Bhagalpuri silk, Silao khaja, Madhubani on paper — and where to find them." />
              {marketplace.length ? (
                <div className="hb-grid" style={{ marginTop: 48 }}>
                  {marketplace.map((item) => (
                    <Card
                      key={item._id || item.id}
                      href={item.link || undefined}
                      external
                      image={item.image}
                      title={item.title}
                      sub={item.location}
                      desc={item.price}
                      icon="signboard"
                      ariaLabel={item.link ? `${item.title}, ${item.location ?? ''}, opens in a new tab` : undefined}
                    />
                  ))}
                </div>
              ) : (
                <p className="hb-caption" style={{ marginTop: 32 }}>Nothing listed yet. The stalls open soon.</p>
              )}
            </div>
          </section>
        </>
      )}

      <MithilaBorder />

      <section className="hb-band hb-band--closing" aria-labelledby="closing-title">
        <div className="hb-wrap">
          <Medallion size={132} />
          <h2 id="closing-title" className="hb-display" style={{ marginTop: 24 }}>
            <span className="block">SAME BIHAR.</span>
            <span className="block">NEW STORIES.</span>
          </h2>
          <p className="hb-banner-hi" lang="hi" style={{ fontSize: 'clamp(18px, 3vw, 32px)' }}>छठ आ रहल बा।</p>
          <div className="hb-banner-actions">
            <Link href="/chhath" className="hb-btn hb-btn--primary">
              Go to the ghat <span className="hb-btn-arrow" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
    </>
  )
}
