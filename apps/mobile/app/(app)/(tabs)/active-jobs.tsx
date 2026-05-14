import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Appbar, Card, Text, ActivityIndicator, useTheme } from 'react-native-paper'
import { JobDto, JobStatus } from '@local/types'
import { useAuth, TOKEN_KEY } from '../../../contexts/AuthContext'
import { getMyJobs } from '../../../lib/api'
import { storage } from '../../../lib/storage'

const STEPS = ['Pending', 'Accepted', 'In Progress', 'Completed'] as const
type Step = (typeof STEPS)[number]
const STEP_INDEX: Record<string, number> = { PENDING: 0, ACCEPTED: 1, IN_PROGRESS: 2, COMPLETED: 3 }

function ProgressTrack({ status }: { status: string }) {
  const current = STEP_INDEX[status] ?? 0
  return (
    <View style={ptStyles.track}>
      {STEPS.map((step, i) => (
        <React.Fragment key={step}>
          <View
            style={[
              ptStyles.dot,
              i < current && ptStyles.dotDone,
              i === current && ptStyles.dotActive,
            ]}
          >
            {i < current && <Text style={ptStyles.check}>✓</Text>}
          </View>
          {i < STEPS.length - 1 && (
            <View style={[ptStyles.line, i < current && ptStyles.lineDone]} />
          )}
        </React.Fragment>
      ))}
    </View>
  )
}

const ptStyles = StyleSheet.create({
  track: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: { backgroundColor: '#14b8a6', borderColor: '#14b8a6' },
  dotActive: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
  check: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  line: { flex: 1, height: 2, backgroundColor: '#e2e8f0' },
  lineDone: { backgroundColor: '#14b8a6' },
})

export default function ActiveJobsScreen() {
  const { user } = useAuth()
  const theme = useTheme()
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [jobs, setJobs] = useState<JobDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    async function loadToken() {
      const stored = await storage.getItemAsync(TOKEN_KEY)
      if (isActive) {
        setToken(stored)
      }
    }

    if (user) {
      void loadToken()
    } else {
      setToken(null)
    }

    return () => {
      isActive = false
    }
  }, [user])

  const fetchJobs = useCallback(
    async (refresh = false) => {
      if (!token) {
        return
      }

      if (refresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      setErrorMessage(null)

      try {
        const data = await getMyJobs(token)
        setJobs(data)
      } catch {
        setErrorMessage("Couldn't load active jobs. Pull down to retry.")
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [token]
  )

  useEffect(() => {
    void fetchJobs()
  }, [fetchJobs])

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={isRefreshing}
        onRefresh={() => fetchJobs(true)}
        tintColor={theme.colors.primary}
      />
    ),
    [fetchJobs, isRefreshing, theme.colors.primary]
  )

  const renderItem = ({ item }: { item: JobDto }) => (
    <Card
      mode="outlined"
      style={styles.card}
      onPress={() => router.push(`/(app)/jobs/${item.id}`)}
    >
      <Card.Content style={styles.cardContent}>
        <Text variant="labelLarge">{item.category}</Text>
        <Text variant="bodyLarge" numberOfLines={2} style={styles.description}>
          {item.description}
        </Text>
        <Text variant="labelLarge" style={styles.meta}>
          Status: {item.status} • {item.timeframe}
        </Text>
        <ProgressTrack status={item.status} />
        {item.status === JobStatus.ACCEPTED && (
          <TouchableOpacity
            style={activeStyles.btnPrimary}
            onPress={() => router.push(`/(app)/jobs/${item.id}`)}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Start job →</Text>
          </TouchableOpacity>
        )}
        {item.status === JobStatus.IN_PROGRESS && (
          <TouchableOpacity
            style={activeStyles.btnPrimary}
            onPress={() => router.push(`/(app)/jobs/${item.id}`)}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Mark complete →</Text>
          </TouchableOpacity>
        )}
        {item.status !== JobStatus.ACCEPTED && item.status !== JobStatus.IN_PROGRESS && (
          <TouchableOpacity
            style={activeStyles.btnSecondary}
            onPress={() => router.push(`/(app)/jobs/${item.id}`)}
          >
            <Text style={{ color: '#0f172a', fontWeight: '600' }}>Details</Text>
          </TouchableOpacity>
        )}
      </Card.Content>
    </Card>
  )

  if (isLoading && jobs.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Active Jobs" />
      </Appbar.Header>

      {errorMessage ? (
        <View style={[styles.errorBanner, { backgroundColor: theme.colors.errorContainer }]}>
          <Text style={{ color: theme.colors.error }}>{errorMessage}</Text>
        </View>
      ) : null}

      {jobs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text variant="headlineSmall" style={styles.emptyHeading}>
            No active jobs
          </Text>
          <Text variant="bodyLarge">Jobs you accept will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={refreshControl}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorBanner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 16,
  },
  card: {
    minHeight: 44,
  },
  cardContent: {
    paddingVertical: 12,
  },
  description: {
    marginTop: 8,
  },
  meta: {
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  emptyHeading: {
    marginBottom: 12,
    fontWeight: '600',
  },
})

const activeStyles = StyleSheet.create({
  btnPrimary: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  btnSecondary: {
    borderWidth: 1,
    borderColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
})
