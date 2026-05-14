import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Appbar, ActivityIndicator, Snackbar, Text, useTheme } from 'react-native-paper'
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
    <View style={detailStyles.container}>
      <Appbar.Header style={detailStyles.appBar}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Job details" titleStyle={detailStyles.appBarTitle} />
      </Appbar.Header>

      {isLoading ? (
        <View style={detailStyles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : errorMessage ? (
        <View style={detailStyles.errorBanner}>
          <Text style={detailStyles.errorText}>{errorMessage}</Text>
        </View>
      ) : job ? (
        <>
          <ScrollView contentContainerStyle={detailStyles.content}>
            {/* Category heading */}
            <Text style={detailStyles.heading}>{job.category}</Text>

            {/* 2-column meta grid */}
            <View style={detailStyles.metaGrid}>
              <View style={detailStyles.metaCell}>
                <Text style={detailStyles.metaLabel}>Area</Text>
                <Text style={detailStyles.metaValue}>{job.cityArea}</Text>
              </View>
              <View style={detailStyles.metaCell}>
                <Text style={detailStyles.metaLabel}>Timeframe</Text>
                <Text style={detailStyles.metaValue}>{job.timeframe}</Text>
              </View>
              <View style={detailStyles.metaCell}>
                <Text style={detailStyles.metaLabel}>Status</Text>
                <Text style={detailStyles.metaValue}>{job.status.replace('_', ' ')}</Text>
              </View>
              <View style={detailStyles.metaCell}>
                <Text style={detailStyles.metaLabel}>Posted</Text>
                <Text style={detailStyles.metaValue}>{new Date(job.createdAt).toLocaleDateString()}</Text>
              </View>
            </View>

            <Text style={detailStyles.descLabel}>Description</Text>
            <Text style={detailStyles.descValue}>{job.description}</Text>
          </ScrollView>

          {/* Pinned CTA */}
          {job.status === JobStatus.PENDING && (
            <View style={detailStyles.pinnedCta}>
              <TouchableOpacity
                style={[detailStyles.ctaBtn, isSubmitting && detailStyles.ctaBtnDisabled]}
                onPress={handleAccept}
                disabled={isSubmitting}
                accessibilityRole="button"
              >
                <Text style={detailStyles.ctaBtnText}>{isSubmitting ? 'Accepting…' : 'Accept job'}</Text>
              </TouchableOpacity>
            </View>
          )}
          {job.status === JobStatus.ACCEPTED && (
            <View style={detailStyles.pinnedCta}>
              <TouchableOpacity
                style={[detailStyles.ctaBtn, isSubmitting && detailStyles.ctaBtnDisabled]}
                onPress={handleStartWork}
                disabled={isSubmitting}
                accessibilityRole="button"
              >
                <Text style={detailStyles.ctaBtnText}>{isSubmitting ? 'Starting…' : 'Start Work'}</Text>
              </TouchableOpacity>
            </View>
          )}
          {job.status === JobStatus.IN_PROGRESS && (
            <View style={detailStyles.pinnedCta}>
              <TouchableOpacity
                style={[detailStyles.ctaBtn, isSubmitting && detailStyles.ctaBtnDisabled]}
                onPress={handleFinishWork}
                disabled={isSubmitting}
                accessibilityRole="button"
              >
                <Text style={detailStyles.ctaBtnText}>{isSubmitting ? 'Finishing…' : 'Finish Work'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : null}

      <Snackbar visible={Boolean(snackbar)} onDismiss={() => setSnackbar(null)} duration={3000}>
        {snackbar}
      </Snackbar>
    </View>
  )
}

const detailStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  appBar: { backgroundColor: '#ffffff', elevation: 0, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  appBarTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  errorBanner: { paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#fef2f2' },
  errorText: { color: '#b91c1c', fontSize: 13 },
  content: { paddingHorizontal: 20, paddingVertical: 24, paddingBottom: 100 },
  heading: { fontSize: 22, fontWeight: '800', color: '#0f172a', letterSpacing: -0.8, marginBottom: 20 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, overflow: 'hidden', marginBottom: 20 },
  metaCell: { width: '50%', padding: 14, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', borderRightWidth: 1, borderRightColor: '#e2e8f0' },
  metaLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4 },
  metaValue: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  descLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 8 },
  descValue: { fontSize: 15, color: '#334155', lineHeight: 22 },
  pinnedCta: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#e2e8f0', backgroundColor: '#ffffff' },
  ctaBtn: { backgroundColor: '#0f172a', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  ctaBtnDisabled: { opacity: 0.5 },
  ctaBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
})
