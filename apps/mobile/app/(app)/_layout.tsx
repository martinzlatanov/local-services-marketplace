import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { useServiceArea } from '../../contexts/ServiceAreaContext'

export default function AppLayout() {
  const { serviceArea, isLoading } = useServiceArea()
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    if (isLoading) {
      return
    }

    const inOnboarding = segments.includes('onboarding')

    if (!serviceArea && !inOnboarding) {
      router.replace('/(app)/onboarding')
      return
    }

    if (serviceArea && inOnboarding) {
      router.replace('/(app)/(tabs)/feed')
    }
  }, [isLoading, router, segments, serviceArea])

  return <Stack screenOptions={{ headerShown: false }} />
}
