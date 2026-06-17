'use client'

import { useState, useEffect, useCallback } from 'react'
import { AppProvider } from '@/app/context/AppContext'
import { useApp } from '@/app/context/AppContext'
import { Header } from '@/app/components/Header/Header'
import { RightPanel } from '@/app/components/RightPanel/RightPanel'
import { CrisisBanner } from '@/app/components/CrisisBanner/CrisisBanner'
import { DashboardView } from '@/app/components/views/DashboardView/DashboardView'
import { MapView } from '@/app/components/views/MapView/MapView'
import { LookupView } from '@/app/components/views/LookupView/LookupView'
import { SimulationView } from '@/app/components/views/SimulationView/SimulationView'
import { SettingsView } from '@/app/components/views/SettingsView/SettingsView'
import { AboutView } from '@/app/components/views/AboutView/AboutView'
import { BottomNav } from '@/app/components/BottomNav/BottomNav'
import styles from './page.module.css'

function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setLeaving(true), 1800)
    const doneTimer = setTimeout(onDone, 2300)
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer) }
  }, [onDone])

  return (
    <div className={`${styles.loadingScreen} ${leaving ? styles.loadingLeaving : ''}`}>
      <div className={styles.loadingInner}>
        <div className={styles.loadingWordmark}>BAYOUWATCH</div>
        <div className={styles.loadingSubtitle}>HOUSTON FLOOD MONITORING SYSTEM</div>
        <div className={styles.loadingBar}>
          <div className={styles.loadingBarFill} />
        </div>
      </div>
    </div>
  )
}

function AppShell() {
  const { currentView } = useApp()
  return (
    <div className={styles.app}>
      <CrisisBanner />
      <Header />
      <main className={styles.main}>
        <DashboardView  active={currentView === 'dashboard'}  />
        <MapView        active={currentView === 'map'}        />
        <LookupView     active={currentView === 'lookup'}     />
        <SimulationView active={currentView === 'simulation'} />
        <SettingsView   active={currentView === 'settings'}   />
        <AboutView      active={currentView === 'about'}      />
      </main>
      <RightPanel />
      <BottomNav />
    </div>
  )
}

export default function Page() {
  const [loading, setLoading] = useState(true)
  const handleDone = useCallback(() => setLoading(false), [])

  return (
    <AppProvider>
      {loading && <LoadingScreen onDone={handleDone} />}
      <AppShell />
    </AppProvider>
  )
}
