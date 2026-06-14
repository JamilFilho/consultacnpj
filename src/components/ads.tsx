"use client"

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemActions,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { BadgeCheck, ChevronRightIcon } from "lucide-react"

interface Ad {
  id: number
  title: string
  headline: string
  image: string
  url: string
}

export function Ads() {
  const [ad, setAd] = useState<Ad | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/data/ads.json')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        const ads: Ad[] = data.ads
        if (ads?.length) {
          setAd(ads[Math.floor(Math.random() * ads.length)])
        } else {
          setError('ads array vazio')
        }
      })
      .catch(err => setError(err.message))
  }, [])

  if (error) return <p className="text-xs text-red-500 my-4">Ads error: {error}</p>
  if (!ad) return null

  return (
     <Item variant="outline" asChild className="my-12">
        <a href={ad.url} target="_blank" rel="noopener noreferrer sponsored">
            <ItemMedia variant="image">
                <Image 
                    src={`/ads/${ad.image}`}
                    alt={ad.title}
                    width={100}
                    height={100}
                />
            </ItemMedia>
            
            <ItemContent>
                <ItemDescription>Patrocinado</ItemDescription>
                <ItemTitle className="line-clamp-1">{ad.title}</ItemTitle>
                <ItemDescription>{ad.headline}</ItemDescription>
            </ItemContent>
            
            <ItemContent className="flex-none text-center">
            </ItemContent>
        </a>
        </Item>
  )
}

export function MiniAds() {
  const [ad, setAd] = useState<Ad | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/data/ads.json')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        const ads: Ad[] = data.ads
        if (ads?.length) {
          setAd(ads[Math.floor(Math.random() * ads.length)])
        } else {
          setError('ads array vazio')
        }
      })
      .catch(err => setError(err.message))
  }, [])

  if (error) return <p className="text-xs text-red-500 my-4">Ads error: {error}</p>
  if (!ad) return null

  return (
    <Item variant="outline" size="sm" asChild className="w-2/3">
        <a href={ad.url} target="_blank" rel="noopener noreferrer sponsored">
            <ItemMedia>
                <BadgeCheck className="size-4" />
            </ItemMedia>
            
            <ItemContent>
                <ItemTitle>{ad.headline}</ItemTitle>
            </ItemContent>
            
            <ItemActions>
                <ChevronRightIcon className="size-4" />
            </ItemActions>
        </a>
    </Item>
  )
}