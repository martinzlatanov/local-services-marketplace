import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { PaperProvider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider, useAuth } from '../contexts/AuthContext'

function NavigationGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    if (isLoading) {
      return
    }

    const inAuthGroup = segments[0] === '(auth)'
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (user && inAuthGroup) {
      router.replace('/')
    }
  }, [isLoading, router, segments, user])

  return <>{children}</>
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AuthProvider>
          <NavigationGuard>
            <Stack screenOptions={{ headerShown: false }} />
          </NavigationGuard>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  )
}
