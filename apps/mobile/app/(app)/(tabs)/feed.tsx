import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Appbar, Card, Text, ActivityIndicator } from 'react-native-paper'
import { JobDto, JobStatus } from '@local/types'
import { useAuth } from '../../../contexts/AuthContext'
import { useServiceArea } from '../../../contexts/ServiceAreaContext'
import { getJobs } from '../../../lib/api'
import { useJobsWebSocket } from '../../../hooks/useJobsWebSocket'

export default function FeedScreen() {
  const { token } = useAuth()
  const { serviceArea } = useServiceArea()
  const router = useRouter()
  const [jobs, setJobs] = useState<JobDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>('All')
  const [page, setPage] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)

  const fetchJobs = useCallback(
    async (refresh = false) => {
      if (!token) return

      if (refresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setErrorMessage(null)

      try {
        const result = await getJobs(token, 0)
        setJobs(result.data)
        setHasNextPage(result.hasNextPage)
        setPage(0)
      } catch (err: any) {
        console.error('fetchJobs error:', JSON.stringify(err))
        setErrorMessage("Couldn't load jobs. Pull down to retry.")
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [token]
  )

  const loadMore = useCallback(async () => {
    if (!token || !hasNextPage || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const nextPage = page + 1
      const result = await getJobs(token, nextPage)
      setJobs(prev => [...prev, ...result.data])
      setHasNextPage(result.hasNextPage)
      setPage(nextPage)
    } catch (err: any) {
      console.error('loadMore error:', JSON.stringify(err))
    } finally {
      setIsLoadingMore(false)
    }
  }, [token, hasNextPage, isLoadingMore, page])

  const fetchJobsRef = useRef(fetchJobs)
  fetchJobsRef.current = fetchJobs

  useEffect(() => {
    void fetchJobsRef.current()
  }, [token])

  const handleJobUpdated = useCallback(
    (job: JobDto) => {
      setJobs(prev => {
        const exists = prev.some(item => item.id === job.id)

        if (job.status !== JobStatus.PENDING) {
          return prev.filter(item => item.id !== job.id)
        }

        if (exists) {
          return prev.map(item => (item.id === job.id ? job : item))
        }

        return [job, ...prev]
      })
    },
    []
  )

  useJobsWebSocket({
    token: token ?? '',
    onJobUpdated: handleJobUpdated,
  })

  const displayedJobs = useMemo(() => {
    if (activeFilter === 'All') return jobs
    return jobs.filter((j) => j.category.name === activeFilter)
  }, [jobs, activeFilter])

  const renderItem = ({ item, index }: { item: JobDto; index: number }) => {
    const isFeatured = index === 0
    return (
      <Card
        mode="outlined"
        style={[styles.card, isFeatured && styles.cardFeatured]}
        onPress={() => router.push(`/(app)/jobs/${item.id}`)}
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text variant="labelSmall" style={styles.categoryLabel}>{item.category.name}</Text>
            <View style={[styles.badge, styles[`badge_${item.status.toLowerCase()}` as keyof typeof styles] as any]}>
              <Text style={styles.badgeText}>{item.status}</Text>
            </View>
          </View>
          <Text variant="bodyMedium" numberOfLines={2} style={styles.description}>{item.description}</Text>
          <Text variant="labelSmall" style={styles.meta}>{item.location.name} · {item.timeframe}</Text>
        </Card.Content>
      </Card>
    )
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appBar}>
        <Appbar.Content title={serviceArea ?? 'Jobs'} titleStyle={styles.appBarTitle} />
      </Appbar.Header>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={styles.chipRowContent}>
        {['All', 'PLUMBING', 'ELECTRICAL', 'CLEANING', 'GARDENING', 'MOVING', 'HANDYMAN', 'PAINTING', 'OTHER'].map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveFilter(cat)}
            style={[styles.chip, activeFilter === cat && styles.chipActive]}
          >
            <Text style={[styles.chipText, activeFilter === cat && styles.chipTextActive]}>
              {cat.charAt(0) + cat.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {errorMessage ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {isLoading && displayedJobs.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0f172a" />
        </View>
      ) : displayedJobs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text variant="headlineSmall" style={styles.emptyHeading}>No jobs available</Text>
          <Text variant="bodyMedium" style={styles.emptyBody}>Pull down to refresh, or check back soon.</Text>
        </View>
      ) : (
        <FlatList
          data={displayedJobs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={isLoadingMore ? <ActivityIndicator size="small" color="#0f172a" style={styles.loadingMore} /> : null}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchJobs(true)}
            />
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  appBar: { backgroundColor: '#ffffff', elevation: 0, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  appBarTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', letterSpacing: -0.5 },
  chipRow: { maxHeight: 48, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  chipRowContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 6, flexDirection: 'row' },
  chip: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 9999, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#ffffff' },
  chipActive: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
  chipText: { fontSize: 13, fontWeight: '500', color: '#475569' },
  chipTextActive: { color: '#ffffff' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorBanner: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fef2f2' },
  errorText: { color: '#b91c1c', fontSize: 13 },
  listContent: { paddingHorizontal: 16, paddingVertical: 16 },
  separator: { height: 12 },
  card: { borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0' },
  cardFeatured: { borderLeftWidth: 3, borderLeftColor: '#14b8a6' },
  cardContent: { paddingVertical: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  categoryLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: '#94a3b8' },
  description: { color: '#1e293b', marginBottom: 8, lineHeight: 20 },
  meta: { color: '#64748b', fontSize: 12 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999 },
  badge_pending:     { backgroundColor: '#fef9c3' },
  badge_accepted:    { backgroundColor: '#dbeafe' },
  badge_in_progress: { backgroundColor: '#ede9fe' },
  badge_completed:   { backgroundColor: '#dcfce7' },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#334155' },
  loadingMore: { paddingVertical: 16 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  emptyHeading: { marginBottom: 8, fontWeight: '600', color: '#0f172a' },
  emptyBody: { color: '#64748b', textAlign: 'center' },
})
