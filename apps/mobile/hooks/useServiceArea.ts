import { useEffect, useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
import { CITY_AREAS } from '@local/types'
import { SERVICE_AREA_KEY } from '../contexts/AuthContext'

// Storage wrapper that works on both web and native
const storage = {
  getItemAsync: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key)
    } else {
      return await SecureStore.getItemAsync(key)
    }
  },
  setItemAsync: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value)
    } else {
      await SecureStore.setItemAsync(key, value)
    }
  },
  deleteItemAsync: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key)
    } else {
      await SecureStore.deleteItemAsync(key)
    }
  }
}

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
        const stored = await storage.getItemAsync(SERVICE_AREA_KEY)
        if (stored && CITY_AREAS.includes(stored as (typeof CITY_AREAS)[number])) {
          setServiceArea(stored)
        } else if (stored) {
          await storage.deleteItemAsync(SERVICE_AREA_KEY)
          setServiceArea(null)
        }
      } finally {
        setIsLoading(false)
      }
    }

    void loadServiceArea()
  }, [])

  async function saveServiceArea(area: string): Promise<void> {
    await storage.setItemAsync(SERVICE_AREA_KEY, area)
    setServiceArea(area)
  }

  async function clearServiceArea(): Promise<void> {
    await storage.deleteItemAsync(SERVICE_AREA_KEY)
    setServiceArea(null)
  }

  return { serviceArea, isLoading, saveServiceArea, clearServiceArea }
}
