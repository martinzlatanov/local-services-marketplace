import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Button, HelperText, Text, TextInput } from 'react-native-paper'
import { useAuth } from '../../contexts/AuthContext'

type ApiErrorResponse = {
  errors?: Record<string, string>
}

export default function LoginScreen() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [topError, setTopError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleLogin() {
    setFieldErrors({})
    setTopError('')
    setSubmitting(true)

    try {
      await login(email, password)
      router.replace('/')
    } catch (error: unknown) {
      const data = error as ApiErrorResponse
      if (data?.errors) {
        const knownKeys = ['email', 'password', 'credentials']
        const hasKnown = knownKeys.some((key) => key in data.errors!)
        if (hasKnown) {
          setFieldErrors(data.errors)
        } else {
          setTopError('Something went wrong. Please try again.')
        }
      } else {
        setTopError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.heading}>
        Sign in
      </Text>
      {topError ? <Text style={styles.topError}>{topError}</Text> : null}
      <TextInput
        label="Email"
        mode="outlined"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        error={Boolean(fieldErrors.email)}
      />
      <HelperText type="error" visible={Boolean(fieldErrors.email)}>
        {fieldErrors.email ?? ''}
      </HelperText>
      <TextInput
        label="Password"
        mode="outlined"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={Boolean(fieldErrors.password || fieldErrors.credentials)}
      />
      <HelperText type="error" visible={Boolean(fieldErrors.password || fieldErrors.credentials)}>
        {fieldErrors.password ?? fieldErrors.credentials ?? ''}
      </HelperText>
      <Button
        mode="contained"
        onPress={handleLogin}
        loading={submitting}
        disabled={submitting}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        {submitting ? 'Signing in...' : 'Sign in'}
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 4 },
  heading: { marginBottom: 16, fontWeight: '600' },
  topError: { color: 'red', marginBottom: 8 },
  button: { marginTop: 8 },
  buttonContent: { minHeight: 44 },
})
