'use client'

import { useApp } from '@/app/context/AppContext'
import { t } from '@/app/lib/i18n'
import styles from './AboutView.module.css'

export function AboutView({ active }: { active: boolean }) {
  const { currentLang } = useApp()

  return (
    <div className={`${styles.view} ${active ? styles.active : ''}`}>
      <div className={styles.hero}>
        <div className={styles.heroTitle}>
          When seconds matter,<br /><em>BayouWatch listens.</em>
        </div>
        <div className={styles.heroText}>
          BayouWatch is a hyperlocal flood alert system for Houston. We use a network of
          solar-powered water-level sensors at bayous, ditches, and storm drains across the
          city — combined with real-time NOAA rainfall data and predictive modeling — to give
          residents 30 to 60 minutes of advance warning before flooding reaches their specific street.
        </div>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="20" height="20" fill="none" stroke="#00e5ff" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div className={styles.featureTitle}>{t(currentLang, 'featureSpeedTitle')}</div>
            <div className={styles.featureDesc}>{t(currentLang, 'featureSpeedDesc')}</div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="20" height="20" fill="none" stroke="#00e5ff" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
            </div>
            <div className={styles.featureTitle}>{t(currentLang, 'featureLocalTitle')}</div>
            <div className={styles.featureDesc}>{t(currentLang, 'featureLocalDesc')}</div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="20" height="20" fill="none" stroke="#00e5ff" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div className={styles.featureTitle}>{t(currentLang, 'featureLangTitle')}</div>
            <div className={styles.featureDesc}>{t(currentLang, 'featureLangDesc')}</div>
          </div>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>Built by Team BayouWatch</div>
        </div>
        <div className={styles.teamText}>
          A finalist project from <strong>Carnegie Vanguard High School</strong>, Houston, TX.<br />
          <strong>Swami Nathan</strong> · Team Lead &amp; Project Manager<br />
          <strong>Vir Sanghavi</strong> · Platform Developer<br />
          <strong>Sashwath Kathiravan</strong> · Presentation Specialist<br />
          <strong>Alois Le Coz</strong> · Lead Researcher
        </div>
      </div>

      <div className={`${styles.panel} ${styles.panelMt}`}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>Data Sources &amp; Partnerships</div>
        </div>
        <div className={styles.sources}>
          → Harris County Flood Control District (sensor infrastructure)<br />
          → NOAA National Hurricane Center (rainfall forecasts)<br />
          → Rice University SSPEED Center (flood modeling)<br />
          → FEMA Hazard Mitigation Grant Program (funding)<br />
          → City of Houston Office of Emergency Management
        </div>
      </div>
    </div>
  )
}
