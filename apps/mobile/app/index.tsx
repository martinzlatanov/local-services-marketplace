import { StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Button, Text } from 'react-native-paper'
import { useAuth } from '../contexts/AuthContext'

export default function HomeScreen() {
  const { user, logout } = useAuth()
  const router = useRouter()

  async function handleLogout() {
    await logout()
    router.replace('/(auth)/login')
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.heading}>
        Home
      </Text>
      <Text>{user?.email}</Text>
      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        Log out
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  heading: { marginBottom: 8, fontWeight: '600' },
  button: { marginTop: 16 },
  buttonContent: { minHeight: 44 },
})
