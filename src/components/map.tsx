"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

interface MapProps {
  logradouro: string
  numero: string
  municipio: string
  uf: string
  cep: string
  complemento?: string
  descricao_tipo_de_logradouro?: string
}

type GeocodingStatus = "idle" | "loading" | "success" | "error"

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

async function geocodeAddress(query: string): Promise<[number, number] | null> {
  const url = new URL(
    "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
      encodeURIComponent(query) +
      ".json"
  )
  url.searchParams.set("access_token", MAPBOX_TOKEN)
  url.searchParams.set("country", "BR")
  url.searchParams.set("limit", "1")
  url.searchParams.set("language", "pt")

  const res = await fetch(url.toString())
  if (!res.ok) return null

  const data = await res.json()
  const feature = data.features?.[0]
  if (!feature) return null

  return feature.center as [number, number]
}

export default function Map({
  logradouro,
  numero,
  municipio,
  uf,
  cep,
  complemento,
  descricao_tipo_de_logradouro,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [status, setStatus] = useState<GeocodingStatus>("idle")

  const addressLine = [
    descricao_tipo_de_logradouro,
    logradouro,
    numero,
    complemento,
    municipio,
    uf,
    cep,
    "Brasil",
  ]
    .filter(Boolean)
    .join(", ")

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    mapboxgl.accessToken = MAPBOX_TOKEN

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [-46.633, -23.55],
      zoom: 12,
      attributionControl: false,
    })

    mapRef.current = map

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right"
    )
    map.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-left"
    )

    setStatus("loading")

    // Aguarda o estilo carregar antes de geocodar e adicionar o marker
    map.once("load", async () => {
      const coords = await geocodeAddress(addressLine)

      if (!coords) {
        setStatus("error")
        return
      }

      map.flyTo({ center: coords, zoom: 17, essential: true, pitch: 0 })

      const el = document.createElement("div")
      el.style.cssText = `
        width: 36px;
        height: 36px;
        background: #2563eb;
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        cursor: pointer;
      `

      new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat(coords)
        .setPopup(
          new mapboxgl.Popup({ offset: 12, closeButton: false }).setHTML(
            `<div style="font-family: system-ui; font-size: 13px; line-height: 1.6; padding: 2px 4px;">
              <strong>${descricao_tipo_de_logradouro ?? ""} ${logradouro}, ${numero}</strong><br/>
              ${municipio} — ${uf}<br/>
              <span style="color: #94a3b8;">${cep.replace(/(\d{5})(\d{3})/, "$1-$2")}</span>
            </div>`
          )
        )
        .addTo(map)
        .togglePopup()

      setStatus("success")
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative w-full h-[80dvh] rounded-lg overflow-hidden">
      {status === "loading" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-muted/70 backdrop-blur-sm">
          <div
            className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin"
            role="status"
            aria-label="Carregando mapa"
          />
          <p className="text-sm text-muted-foreground">Localizando endereço…</p>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 bg-muted/80 backdrop-blur-sm">
          <p className="text-sm font-medium text-destructive">
            Endereço não encontrado
          </p>
          <p className="text-xs text-muted-foreground">{addressLine}</p>
        </div>
      )}

      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}