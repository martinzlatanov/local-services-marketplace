import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Appbar, ActivityIndicator, Button, Snackbar, Text, useTheme } from 'react-native-paper'
import { JobDto, JobStatus } from '@local/types'
import { TOKEN_KEY } from '../../../contexts/AuthContext'
import { acceptJob, getJob, updateJobStatus } from '../../../lib/api'
import { storage } from '../../../lib/storage'

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const router = useRouter()
  const theme = useTheme()
  const [token, setToken] = useState<string | null>(null)
  const [job, setJob] = useState<JobDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    async function loadToken() {
      const stored = await storage.getItemAsync(TOKEN_KEY)
      if (isActive) {
        setToken(stored)
      }
    }

    void loadToken()

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    async function loadJob() {
      if (!token || !id) {
        return
      }

      setIsLoading(true)
      setErrorMessage(null)

      try {
        const data = await getJob(token, String(id))
        setJob(data)
      } catch {
        setErrorMessage("Couldn't load this job. Tap back and try again.")
      } finally {
        setIsLoading(false)
      }
    }

    void loadJob()
  }, [id, token])

  async function handleAccept() {
    if (!token || !job || isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      await acceptJob(token, job.id, job.version)
      router.back()
    } catch (err: any) {
      const status = err?.status
      if (status === 409) {
        setSnackbar('Job already taken')
        router.replace({ pathname: '/(app)/(tabs)/feed', params: { conflict: '1' } })
      } else {
        setSnackbar("Couldn't accept job. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleStartWork() {
    if (!token || !job || isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      await updateJobStatus(token, job.id, JobStatus.IN_PROGRESS)
      router.back()
    } catch (err: any) {
      setSnackbar("Couldn't start work. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleFinishWork() {
    if (!token || !job || isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      await updateJobStatus(token, job.id, JobStatus.COMPLETED)
      router.back()
    } catch (err: any) {
      setSnackbar("Couldn't finish work. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Job details" />
      </Appbar.Header>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : errorMessage ? (
        <View style={styles.errorBanner}>
          <Text style={{ color: theme.colors.error }}>{errorMessage}</Text>
        </View>
      ) : job ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text variant="headlineSmall" style={styles.heading}>
            {job.category}
          </Text>

          <Text variant="labelLarge" style={styles.label}>
            Description
          </Text>
          <Text variant="bodyLarge" style={styles.value}>
            {job.description}
          </Text>

          <Text variant="labelLarge" style={styles.label}>
            Timeframe
          </Text>
          <Text variant="bodyLarge" style={styles.value}>
            {job.timeframe}
          </Text>

          <Text variant="labelLarge" style={styles.label}>
            Area
          </Text>
          <Text variant="bodyLarge" style={styles.value}>
            {job.cityArea}
          </Text>

          {job.status === JobStatus.PENDING && (
            <Button
              mode="contained"
              onPress={handleAccept}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={styles.actionButton}
              contentStyle={styles.actionButtonContent}
            >
              {isSubmitting ? 'Accepting...' : 'Accept job'}
            </Button>
          )}

          {job.status === JobStatus.ACCEPTED && (
            <Button
              mode="contained"
              onPress={handleStartWork}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={styles.actionButton}
              contentStyle={styles.actionButtonContent}
            >
              {isSubmitting ? 'Starting...' : 'Start Work'}
            </Button>
          )}

          {job.status === JobStatus.IN_PROGRESS && (
            <Button
              mode="contained"
              onPress={handleFinishWork}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={styles.actionButton}
              contentStyle={styles.actionButtonContent}
            >
              {isSubmitting ? 'Finishing...' : 'Finish Work'}
            </Button>
          )}
        </ScrollView>
      ) : null}

      <Snackbar visible={Boolean(snackbar)} onDismiss={() => setSnackbar(null)} duration={3000}>
        {snackbar}
      </Snackbar>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorBanner: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  heading: {
    marginBottom: 16,
    fontWeight: '600',
  },
  label: {
    marginTop: 16,
  },
  value: {
    marginTop: 8,
  },
  actionButton: {
    marginTop: 32,
  },
  actionButtonContent: {
    minHeight: 44,
  },
})
