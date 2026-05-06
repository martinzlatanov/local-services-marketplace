import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Button, HelperText, Text, TextInput } from 'react-native-paper'
import { useAuth } from '../../contexts/AuthContext'

type ApiErrorResponse = {
  errors?: Record<string, string>
}

const API_BASE = 'http://localhost:3000'

export default function RegisterScreen() {
  const { setTokenAndUser } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'CLIENT' | 'PROVIDER'>('PROVIDER')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [topError, setTopError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleRegister() {
    setFieldErrors({})
    setTopError('')
    setSubmitting(true)

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      })

      if (!res.ok) {
        const data = (await res.json()) as ApiErrorResponse
        if (data?.errors) {
          const knownKeys = ['email', 'password', 'role']
          const hasKnown = knownKeys.some((key) => key in data.errors!)
          if (hasKnown) {
            setFieldErrors(data.errors)
          } else {
            setTopError('Something went wrong. Please try again.')
          }
        } else {
          setTopError('Something went wrong. Please try again.')
        }
        return
      }

      const data = (await res.json()) as { user: Parameters<typeof setTokenAndUser>[1]; token: string }
      await setTokenAndUser(data.token, data.user)
      router.replace('/')
    } catch {
      setTopError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.heading}>
        Create account
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
        error={Boolean(fieldErrors.password)}
      />
      <HelperText type="error" visible={Boolean(fieldErrors.password)}>
        {fieldErrors.password ?? ''}
      </HelperText>
      <Text variant="labelLarge" style={styles.roleLabel}>
        Role
      </Text>
      <View style={styles.roleRow}>
        <Pressable
          onPress={() => setRole('CLIENT')}
          style={[styles.roleButton, role === 'CLIENT' && styles.roleButtonSelected]}
        >
          <Text style={[styles.roleButtonText, role === 'CLIENT' && styles.roleButtonTextSelected]}>
            Client
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setRole('PROVIDER')}
          style={[styles.roleButton, role === 'PROVIDER' && styles.roleButtonSelected]}
        >
          <Text style={[styles.roleButtonText, role === 'PROVIDER' && styles.roleButtonTextSelected]}>
            Provider
          </Text>
        </Pressable>
      </View>
      <HelperText type="error" visible={Boolean(fieldErrors.role)}>
        {fieldErrors.role ?? ''}
      </HelperText>
      <Button
        mode="contained"
        onPress={handleRegister}
        loading={submitting}
        disabled={submitting}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        {submitting ? 'Creating account...' : 'Create account'}
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 4 },
  heading: { marginBottom: 16, fontWeight: '600' },
  topError: { color: 'red', marginBottom: 8 },
  roleLabel: { marginTop: 8 },
  roleRow: { flexDirection: 'row', gap: 8 },
  roleButton: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 12,
  },
  roleButtonSelected: {
    borderColor: '#4f46e5',
    backgroundColor: '#e0e7ff',
  },
  roleButtonText: { fontWeight: '600', color: '#374151' },
  roleButtonTextSelected: { color: '#4338ca' },
  button: { marginTop: 8 },
  buttonContent: { minHeight: 44 },
})
