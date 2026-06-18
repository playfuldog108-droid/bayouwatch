'use client'

import styles from './HeroSection.module.css'
import { useApp } from '@/app/context/AppContext'
import { t } from '@/app/lib/i18n'

export function HeroSection() {
  const { setCurrentView, currentLang } = useApp()

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
          {t(currentLang, 'heroLiveDashboard')}
        </button>
      </nav>

      <div className={styles.streaks} aria-hidden="true" />
      <div className={styles.ambientGlow} aria-hidden="true" />

      <div className={styles.content}>
        <h1 className={styles.wordmark}>BAYOUWATCH</h1>
        <p className={styles.subtitle}>{t(currentLang, 'heroSubtitle')}</p>
        <div className={styles.tabBar}>
          <button className={styles.tabBtn} onClick={scrollToDashboard}>
            {t(currentLang, 'heroCta1')}
          </button>
          <button className={styles.tabBtn} onClick={goToLookup}>
            {t(currentLang, 'heroCta2')}
          </button>
        </div>
      </div>

      <button className={styles.scrollHint} onClick={scrollToDashboard}>
        {t(currentLang, 'heroScrollHint')}
      </button>
    </section>
  )
}
