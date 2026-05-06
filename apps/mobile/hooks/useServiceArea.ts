import { useEffect, useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import { CITY_AREAS } from '@local/types'
import { SERVICE_AREA_KEY } from '../contexts/AuthContext'

interface UseServiceAreaResult {
  serviceArea: string | null
  isLoading: boolean
  saveServiceArea: (area: string) => Promise<void>
  clearServiceArea: () => Promise<void>
}

export function useServiceArea(): UseServiceAreaResult {
  const [serviceArea, setServiceArea] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadServiceArea() {
      try {
        const stored = await SecureStore.getItemAsync(SERVICE_AREA_KEY)
        if (stored && CITY_AREAS.includes(stored as (typeof CITY_AREAS)[number])) {
          setServiceArea(stored)
        } else if (stored) {
          await SecureStore.deleteItemAsync(SERVICE_AREA_KEY)
          setServiceArea(null)
        }
      } finally {
        setIsLoading(false)
      }
    }

    void loadServiceArea()
  }, [])

  async function saveServiceArea(area: string): Promise<void> {
    await SecureStore.setItemAsync(SERVICE_AREA_KEY, area)
    setServiceArea(area)
  }

  async function clearServiceArea(): Promise<void> {
    await SecureStore.deleteItemAsync(SERVICE_AREA_KEY)
    setServiceArea(null)
  }

  return { serviceArea, isLoading, saveServiceArea, clearServiceArea }
}
