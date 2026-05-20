import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { MD3LightTheme, PaperProvider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { ServiceAreaProvider, useServiceArea } from '../contexts/ServiceAreaContext'

const appTheme: typeof MD3LightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#0f172a',
    secondary: '#14b8a6',
  },
}

function NavigationGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const { serviceArea, isLoading: isServiceAreaLoading } = useServiceArea()
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    if (isLoading || isServiceAreaLoading) {
      return
    }

    const inAuthGroup = segments[0] === '(auth)'
    const inAppGroup = segments[0] === '(app)'
    const inOnboarding = (segments as string[]).includes('onboarding')

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login')
      return
    }

    if (user && inAuthGroup) {
      router.replace('/(app)/(tabs)/feed')
      return
    }

    if (user && !serviceArea && !inOnboarding) {
      router.replace('/(app)/onboarding')
      return
    }

    if (user && serviceArea && inOnboarding) {
      router.replace('/(app)/(tabs)/feed')
    }
  }, [isLoading, isServiceAreaLoading, router, segments, serviceArea, user])

  return <>{children}</>
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={appTheme}>
        <AuthProvider>
          <ServiceAreaProvider>
            <NavigationGuard>
              <Stack screenOptions={{ headerShown: false }} />
            </NavigationGuard>
          </ServiceAreaProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  )
}
