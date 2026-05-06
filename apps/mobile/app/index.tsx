import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { useAuth } from '../contexts/AuthContext'

export default function Index() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (user) {
      router.replace('/(app)/(tabs)/feed')
    } else {
      router.replace('/(auth)/login')
    }
  }, [isLoading, router, user])

  return null
}
