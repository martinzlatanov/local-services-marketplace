import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
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

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0d9488" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
})
