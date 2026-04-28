'use client'

import { AppProvider } from '@/app/context/AppContext'
import { useApp } from '@/app/context/AppContext'
import { Header } from '@/app/components/Header/Header'
import { Sidebar } from '@/app/components/Sidebar/Sidebar'
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

function AppShell() {
  const { currentView } = useApp()
  return (
    <div className={styles.app}>
      <CrisisBanner />
      <Header />
      <Sidebar />
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
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}
