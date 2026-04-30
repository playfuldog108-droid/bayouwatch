'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './LookupView.module.css'

// ---------- public types -----------------------------------------------

export interface SensorPin {
  lat: number
  lng: number
  name: string
  bayou: string
  siteCode: string
  level: number
  stageFt?: number
  status: 'safe' | 'watch' | 'alert'
  distanceMiles: number
}

export interface FloodMapProps {
  lat: number
  lng: number
  formattedAddress: string
  sensorPins: SensorPin[]
}

// ---------- minimal Google Maps stubs ----------------------------------

interface GMapInstance { }
interface GMarkerInstance { addListener(event: string, cb: () => void): void }
interface GInfoWindowInstance {
  open(map: GMapInstance, marker: GMarkerInstance): void
  close(): void
}
interface GMapsLib {
  Map: new (el: HTMLElement, opts: object) => GMapInstance
  Marker: new (opts: object) => GMarkerInstance
  InfoWindow: new (opts: object) => GInfoWindowInstance
  SymbolPath: { CIRCLE: number }
}
declare global {
  interface Window {
    google?: { maps: GMapsLib }
    __bwMapsLoading?: Promise<void>
  }
}

// ---------- script loader singleton ------------------------------------

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

function loadMapsScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.google?.maps?.Map) return Promise.resolve()
  if (window.__bwMapsLoading) return window.__bwMapsLoading

  console.log('[FloodMap] loading Google Maps JS API, key present:', !!MAPS_KEY)

  window.__bwMapsLoading = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}`
    script.async = true
    script.defer = true
    script.onload = () => {
      console.log('[FloodMap] script loaded, window.google.maps:', !!window.google?.maps)
      resolve()
    }
    script.onerror = () => {
      console.error('[FloodMap] script failed to load (network error or invalid key)')
      reject(new Error('Google Maps script failed to load'))
    }
    document.head.appendChild(script)
  })
  return window.__bwMapsLoading
}

// ---------- dark map style --------------------------------------------

const MAP_STYLES = [
  { elementType: 'geometry',           stylers: [{ color: '#0f1923' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f1923' }] },
  { elementType: 'labels.text.fill',   stylers: [{ color: '#8a9bb0' }] },
  { featureType: 'road',  elementType: 'geometry',          stylers: [{ color: '#1e3a5f' }] },
  { featureType: 'road',  elementType: 'geometry.stroke',   stylers: [{ color: '#152c47' }] },
  { featureType: 'road',  elementType: 'labels.text.fill',  stylers: [{ color: '#5c7a9e' }] },
  { featureType: 'water', elementType: 'geometry',          stylers: [{ color: '#0a2540' }] },
  { featureType: 'water', elementType: 'labels.text.fill',  stylers: [{ color: '#3d6880' }] },
  { featureType: 'poi',       elementType: 'geometry', stylers: [{ color: '#131f2e' }] },
  { featureType: 'transit',   elementType: 'geometry', stylers: [{ color: '#151f2e' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1f3248' }] },
  { featureType: 'landscape',      elementType: 'geometry', stylers: [{ color: '#111922' }] },
]

// ---------- helpers ---------------------------------------------------

function pinIcon(color: string, scale: number) {
  return { path: 0, scale, fillColor: color, fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 2 }
}

function sensorInfoContent(pin: SensorPin): string {
  const color = pin.status === 'alert' ? '#dc2626' : pin.status === 'watch' ? '#d97706' : '#16a34a'
  const label = pin.status === 'alert' ? 'FLOOD ALERT' : pin.status === 'watch' ? 'WATCH' : 'NORMAL'
  return [
    `<div style="font-family:monospace;font-size:12px;color:#1a202c;padding:4px 2px;min-width:170px;line-height:1.7">`,
    `<strong style="font-size:13px">${pin.name}</strong><br/>`,
    `<span style="color:#4a5568">Bayou:</span> ${pin.bayou}<br/>`,
    `<span style="color:#4a5568">Level:</span> ${pin.level.toFixed(0)}%`,
    pin.stageFt !== undefined ? ` (${pin.stageFt.toFixed(1)} ft)` : '',
    `<br/>`,
    `<span style="color:#4a5568">Status:</span> <strong style="color:${color}">${label}</strong><br/>`,
    `<span style="color:#4a5568">Distance:</span> ${pin.distanceMiles.toFixed(1)} mi`,
    `</div>`,
  ].join('')
}

// ---------- component -------------------------------------------------

export function FloodMap({ lat, lng, formattedAddress, sensorPins }: FloodMapProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const [mapState, setMapState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [mapError, setMapError] = useState('')

  useEffect(() => {
    let cancelled = false
    setMapState('loading')
    setMapError('')

    console.log('[FloodMap] useEffect fired, lat:', lat, 'lng:', lng)

    loadMapsScript()
      .then(() => {
        if (cancelled) { console.log('[FloodMap] cancelled before init'); return }
        if (!divRef.current) { console.error('[FloodMap] divRef.current is null'); return }
        if (!window.google?.maps) {
          console.error('[FloodMap] window.google.maps not available after script load')
          if (!cancelled) { setMapState('error'); setMapError('Google Maps not available — check API key') }
          return
        }

        console.log('[FloodMap] initializing map in div:', divRef.current)
        try {
          const maps = window.google.maps
          const map = new maps.Map(divRef.current, {
            center: { lat, lng },
            zoom: 13,
            mapTypeId: 'roadmap',
            styles: MAP_STYLES,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          })
          console.log('[FloodMap] map created:', map)

          // Blue pin — user's address
          const userMarker = new maps.Marker({
            position: { lat, lng },
            map,
            title: formattedAddress,
            icon: pinIcon('#3b82f6', 10),
            zIndex: 10,
          })
          const userInfo = new maps.InfoWindow({
            content: `<div style="font-family:monospace;font-size:12px;color:#1a202c;padding:4px 2px"><strong>Your Address</strong><br/>${formattedAddress}</div>`,
          })
          userMarker.addListener('click', () => userInfo.open(map, userMarker))

          // Sensor pins
          for (const pin of sensorPins) {
            const color = pin.status === 'alert' ? '#ef4444' : pin.status === 'watch' ? '#f59e0b' : '#22c55e'
            const marker = new maps.Marker({
              position: { lat: pin.lat, lng: pin.lng },
              map,
              title: `${pin.name} — ${pin.level.toFixed(0)}%`,
              icon: pinIcon(color, 8),
              zIndex: 5,
            })
            const info = new maps.InfoWindow({ content: sensorInfoContent(pin) })
            marker.addListener('click', () => info.open(map, marker))
          }

          if (!cancelled) setMapState('ready')
        } catch (err) {
          console.error('[FloodMap] map init threw:', err)
          if (!cancelled) {
            setMapState('error')
            setMapError(
              err instanceof Error
                ? `Map error: ${err.message}`
                : 'Map initialization failed — ensure Maps JavaScript API is enabled in Google Cloud Console'
            )
          }
        }
      })
      .catch(err => {
        console.error('[FloodMap] script load failed:', err)
        if (!cancelled) {
          setMapState('error')
          setMapError('Failed to load Google Maps script — check network and API key')
        }
      })

    return () => { cancelled = true }
  }, [lat, lng, formattedAddress, sensorPins])

  return (
    <div className={styles.mapWrapper}>
      <div className={styles.mapLegend}>
        <span className={styles.legendDot} style={{ background: '#3b82f6' }} /> Your address
        <span className={styles.legendDot} style={{ background: '#22c55e', marginLeft: 12 }} /> Normal
        <span className={styles.legendDot} style={{ background: '#f59e0b', marginLeft: 12 }} /> Watch
        <span className={styles.legendDot} style={{ background: '#ef4444', marginLeft: 12 }} /> Alert
      </div>
      <div style={{ position: 'relative' }}>
        {mapState !== 'ready' && (
          <div className={`${styles.mapOverlay} ${mapState === 'error' ? styles.mapOverlayError : ''}`}>
            {mapState === 'loading' ? 'Loading map…' : mapError}
          </div>
        )}
        <div ref={divRef} className={styles.mapContainer} />
      </div>
    </div>
  )
}
