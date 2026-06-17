'use client'

import styles from './HeroSection.module.css'
import { useApp } from '@/app/context/AppContext'

export function HeroSection() {
  const { setCurrentView } = useApp()

  function scrollToDashboard() {
    document.getElementById('dashboard-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  function goToLookup() {
    setCurrentView('lookup')
    scrollToDashboard()
  }

  return (
    <section className={styles.hero}>
      <nav className={styles.heroNav}>
        <span className={styles.heroNavLogo}>BAYOUWATCH</span>
        <button className={styles.heroNavCta} onClick={scrollToDashboard}>
          Live Dashboard →
        </button>
      </nav>

      <div className={styles.streaks} aria-hidden="true" />
      <div className={styles.ambientGlow} aria-hidden="true" />

      <div className={styles.content}>
        <h1 className={styles.wordmark}>BAYOUWATCH</h1>
        <p className={styles.subtitle}>
          Real-time flood monitoring for Houston neighborhoods.{' '}
          47 sensors. Live data. 30–60 minute early warnings.
        </p>
        <div className={styles.buttons}>
          <button className={styles.btnPrimary} onClick={scrollToDashboard}>
            VIEW LIVE DASHBOARD
          </button>
          <button className={styles.btnOutline} onClick={goToLookup}>
            CHECK MY ADDRESS
          </button>
        </div>
      </div>

      <button className={styles.scrollHint} onClick={scrollToDashboard}>
        SCROLL DOWN ↓
      </button>
    </section>
  )
}
