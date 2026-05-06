import { useCallback, useEffect, useMemo, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Appbar, Card, Text, ActivityIndicator, useTheme } from 'react-native-paper'
import * as SecureStore from 'expo-secure-store'
import { JobDto, JobStatus } from '@local/types'
import { useAuth, TOKEN_KEY } from '../../../contexts/AuthContext'
import { useServiceArea } from '../../../hooks/useServiceArea'
import { getJobs } from '../../../lib/api'
import { useJobsWebSocket } from '../../../hooks/useJobsWebSocket'

export default function FeedScreen() {
  const { user } = useAuth()
  const { serviceArea } = useServiceArea()
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
      const stored = await SecureStore.getItemAsync(TOKEN_KEY)
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
      if (!token || !serviceArea) {
        return
      }

      if (refresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      setErrorMessage(null)

      try {
        const data = await getJobs(token, serviceArea)
        setJobs(data)
      } catch {
        setErrorMessage("Couldn't load jobs. Pull down to retry.")
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [serviceArea, token]
  )

  useEffect(() => {
    void fetchJobs()
  }, [fetchJobs])

  const handleJobUpdated = useCallback(
    (job: JobDto) => {
      if (!serviceArea) {
        return
      }

      setJobs(prev => {
        const matchesArea = job.cityArea === serviceArea
        const exists = prev.some(item => item.id === job.id)

        if (job.status !== JobStatus.PENDING || !matchesArea) {
          return prev.filter(item => item.id !== job.id)
        }

        if (exists) {
          return prev.map(item => (item.id === job.id ? job : item))
        }

        return [job, ...prev]
      })
    },
    [serviceArea]
  )

  useJobsWebSocket({
    token: token ?? '',
    onJobUpdated: handleJobUpdated,
    onReconnect: () => {
      void fetchJobs(true)
    },
  })

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
      mode="elevated"
      style={styles.card}
      onPress={() => router.push(`/(app)/jobs/${item.id}`)}
    >
      <Card.Content style={styles.cardContent}>
        <Text variant="labelLarge">{item.category}</Text>
        <Text variant="bodyLarge" numberOfLines={2} style={styles.description}>
          {item.description}
        </Text>
        <Text variant="labelLarge" style={styles.meta}>
          {item.cityArea} • {item.timeframe}
        </Text>
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
        <Appbar.Content title={serviceArea ?? ''} />
      </Appbar.Header>

      {errorMessage ? (
        <View style={[styles.errorBanner, { backgroundColor: theme.colors.errorContainer }]}>
          <Text style={{ color: theme.colors.error }}>{errorMessage}</Text>
        </View>
      ) : null}

      {jobs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text variant="headlineSmall" style={styles.emptyHeading}>
            No jobs in your area yet
          </Text>
          <Text variant="bodyLarge">Pull down to refresh, or check back soon.</Text>
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
