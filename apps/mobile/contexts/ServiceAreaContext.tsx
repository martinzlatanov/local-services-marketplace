import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { SERVICE_AREA_KEY } from './AuthContext'
import { storage } from '../lib/storage'

interface ServiceAreaContextValue {
  serviceArea: string | null
  isLoading: boolean
  saveServiceArea: (area: string) => Promise<void>
  clearServiceArea: () => Promise<void>
}

const ServiceAreaContext = createContext<ServiceAreaContextValue | null>(null)

export function ServiceAreaProvider({ children }: { children: ReactNode }) {
  const [serviceArea, setServiceArea] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const stored = await storage.getItemAsync(SERVICE_AREA_KEY)
        if (stored) setServiceArea(stored)
      } finally {
        setIsLoading(false)
      }
    }
    void load()
  }, [])

  async function saveServiceArea(area: string): Promise<void> {
    await storage.setItemAsync(SERVICE_AREA_KEY, area)
    setServiceArea(area)
  }

  async function clearServiceArea(): Promise<void> {
    await storage.deleteItemAsync(SERVICE_AREA_KEY)
    setServiceArea(null)
  }

  return (
    <ServiceAreaContext.Provider value={{ serviceArea, isLoading, saveServiceArea, clearServiceArea }}>
      {children}
    </ServiceAreaContext.Provider>
  )
}

export function useServiceArea(): ServiceAreaContextValue {
  const ctx = useContext(ServiceAreaContext)
  if (!ctx) throw new Error('useServiceArea must be used within ServiceAreaProvider')
  return ctx
}
