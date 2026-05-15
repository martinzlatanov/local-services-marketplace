import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { jobs, reviews } from '@/lib/db/schema'
import { getAuthenticatedUser } from '@/lib/auth'
import { ReviewDTO, ApiSuccessResponse, ApiErrorResponse, JobStatus, Role } from '@/lib/types'
import { eq } from 'drizzle-orm'

// Validation helpers
function isValidRating(value: number | undefined): value is number {
  return typeof value === 'number' && value >= 1 && value <= 5
}

function isValidClientRatings(ratings: any): boolean {
  if (!ratings || typeof ratings !== 'object') return false
  const { communication, quality, punctuality } = ratings
  return (
    isValidRating(communication) &&
    isValidRating(quality) &&
    isValidRating(punctuality)
  )
}

function isValidProviderRatings(ratings: any): boolean {
  if (!ratings || typeof ratings !== 'object') return false
  const { paymentReliability, communicationClarity, professionalism } = ratings
  return (
    isValidRating(paymentReliability) &&
    isValidRating(communicationClarity) &&
    isValidRating(professionalism)
  )
}

export async function POST(req: Request) {
  // 1. Authenticate user
  const user = await getAuthenticatedUser(req)
  if (!user) return NextResponse.json({ errors: { auth: 'unauthorized' } }, { status: 401 })

  // 2. Parse request body
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ errors: { body: 'invalid_json' } }, { status: 400 })

  const {
    jobId,
    clientRating,
    providerRating,
    text,
    photoUrl,
  } = body as any

  // 3. Validate required fields
  if (!jobId) {
    return NextResponse.json({ errors: { jobId: 'required' } }, { status: 400 })
  }

  const jobIdNum = typeof jobId === 'string' ? parseInt(jobId, 10) : jobId
  if (isNaN(jobIdNum)) {
    return NextResponse.json({ errors: { jobId: 'must_be_number' } }, { status: 400 })
  }

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json({ errors: { text: 'required' } }, { status: 400 })
  }

  if (text.length > 1000) {
    return NextResponse.json({ errors: { text: 'max_1000_chars' } }, { status: 400 })
  }

  // 4. Fetch job to verify existence and status
  const [job] = await db.select().from(jobs).where(eq(jobs.id, jobIdNum)).limit(1)
  if (!job) {
    return NextResponse.json({ errors: { job: 'not_found' } }, { status: 404 })
  }

  if (job.status !== JobStatus.COMPLETED) {
    return NextResponse.json(
      { errors: { job: 'must_be_completed' } },
      { status: 400 }
    )
  }

  // 5. Determine review type and validate user is participant
  let reviewType: 'client' | 'provider'
  let revieweeId: number
  let clientCommunication: number | undefined
  let clientQuality: number | undefined
  let clientPunctuality: number | undefined
  let providerPaymentReliability: number | undefined
  let providerCommunicationClarity: number | undefined
  let providerProfessionalism: number | undefined

  const userId = parseInt(user.id, 10)

  if (user.roles.includes(Role.CLIENT)) {
    // Client reviewing provider
    if (job.clientId !== userId) {
      return NextResponse.json(
        { errors: { auth: 'not_job_participant' } },
        { status: 403 }
      )
    }

    if (!clientRating || !isValidClientRatings(clientRating)) {
      return NextResponse.json(
        { errors: { clientRating: 'invalid_rating_values' } },
        { status: 400 }
      )
    }

    reviewType = 'client'
    revieweeId = job.providerId ?? 0
    if (!revieweeId) {
      return NextResponse.json(
        { errors: { job: 'no_provider_assigned' } },
        { status: 400 }
      )
    }

    clientCommunication = clientRating.communication
    clientQuality = clientRating.quality
    clientPunctuality = clientRating.punctuality
    // Explicitly set provider fields to null
    providerPaymentReliability = null as any
    providerCommunicationClarity = null as any
    providerProfessionalism = null as any
  } else if (user.roles.includes(Role.PROVIDER)) {
    // Provider reviewing client
    if (job.providerId !== userId) {
      return NextResponse.json(
        { errors: { auth: 'not_job_participant' } },
        { status: 403 }
      )
    }

    if (!providerRating || !isValidProviderRatings(providerRating)) {
      return NextResponse.json(
        { errors: { providerRating: 'invalid_rating_values' } },
        { status: 400 }
      )
    }

    reviewType = 'provider'
    revieweeId = job.clientId

    providerPaymentReliability = providerRating.paymentReliability
    providerCommunicationClarity = providerRating.communicationClarity
    providerProfessionalism = providerRating.professionalism
    // Explicitly set client fields to null
    clientCommunication = null as any
    clientQuality = null as any
    clientPunctuality = null as any
  } else {
    return NextResponse.json(
      { errors: { role: 'invalid_role' } },
      { status: 403 }
    )
  }

  // 6. Validate photoUrl (if provided)
  if (photoUrl) {
    if (typeof photoUrl !== 'string') {
      return NextResponse.json(
        { errors: { photoUrl: 'invalid_format' } },
        { status: 400 }
      )
    }

    // Allow both HTTPS URLs and data URLs
    const isValidUrl = photoUrl.startsWith('https://') || photoUrl.startsWith('data:')
    if (!isValidUrl) {
      return NextResponse.json(
        { errors: { photoUrl: 'invalid_url' } },
        { status: 400 }
      )
    }

    // For data URLs, check length; for HTTPS, they should be reasonably sized
    if (photoUrl.length > 5 * 1024 * 1024) {
      return NextResponse.json(
        { errors: { photoUrl: 'url_too_large' } },
        { status: 400 }
      )
    }
  }

  // 7. Try inserting review
  try {
    const insertValues: any = {
      jobId: jobIdNum,
      reviewerId: userId,
      revieweeId,
      reviewType,
      text: text.trim(),
    }

    // Only include fields that have values
    if (clientCommunication !== null && clientCommunication !== undefined) {
      insertValues.clientCommunication = clientCommunication
    }
    if (clientQuality !== null && clientQuality !== undefined) {
      insertValues.clientQuality = clientQuality
    }
    if (clientPunctuality !== null && clientPunctuality !== undefined) {
      insertValues.clientPunctuality = clientPunctuality
    }
    if (providerPaymentReliability !== null && providerPaymentReliability !== undefined) {
      insertValues.providerPaymentReliability = providerPaymentReliability
    }
    if (providerCommunicationClarity !== null && providerCommunicationClarity !== undefined) {
      insertValues.providerCommunicationClarity = providerCommunicationClarity
    }
    if (providerProfessionalism !== null && providerProfessionalism !== undefined) {
      insertValues.providerProfessionalism = providerProfessionalism
    }
    if (photoUrl) {
      insertValues.photoUrl = photoUrl
    }

    const [newReview] = await db
      .insert(reviews)
      .values(insertValues)
      .returning()

    // 8. Return 201 + review data
    const reviewDto: ReviewDTO = {
      id: newReview.id,
      jobId: newReview.jobId,
      reviewerId: newReview.reviewerId,
      revieweeId: newReview.revieweeId,
      reviewType: newReview.reviewType as 'client' | 'provider',
      clientCommunication: newReview.clientCommunication || undefined,
      clientQuality: newReview.clientQuality || undefined,
      clientPunctuality: newReview.clientPunctuality || undefined,
      providerPaymentReliability: newReview.providerPaymentReliability || undefined,
      providerCommunicationClarity: newReview.providerCommunicationClarity || undefined,
      providerProfessionalism: newReview.providerProfessionalism || undefined,
      text: newReview.text,
      photoUrl: newReview.photoUrl,
      approvedAt: newReview.approvedAt ? newReview.approvedAt.toISOString() : null,
      createdAt: newReview.createdAt.toISOString(),
      updatedAt: newReview.updatedAt.toISOString(),
    }

    return NextResponse.json(
      { data: reviewDto } as ApiSuccessResponse<ReviewDTO>,
      { status: 201 }
    )
  } catch (error: any) {
    // 9. Catch unique constraint violation
    if (error.code === '23505' || error.message?.includes('unique')) {
      return NextResponse.json(
        { errors: { review: 'already_submitted' } },
        { status: 409 }
      )
    }

    console.error('Review insert error:', {
      code: error.code,
      message: error.message,
      detail: error.detail,
      errorObj: JSON.stringify(error),
    })
    return NextResponse.json(
      { errors: { database: 'insert_failed', detail: error.message } },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  const { isNotNull, and, isNull } = await import('drizzle-orm')
  const url = new URL(req.url)
  const jobId = url.searchParams.get('jobId')
  const userId = url.searchParams.get('userId')
  const approved = url.searchParams.get('approved')

  // Pattern 0: Admin pending reviews queue - GET /api/reviews?approved=false
  if (approved === 'false' && !jobId && !userId) {
    const user = await getAuthenticatedUser(req)
    if (!user) return NextResponse.json({ errors: { auth: 'unauthorized' } }, { status: 401 })
    if (!user.roles.includes(Role.ADMIN)) {
      return NextResponse.json(
        { errors: { role: 'admin_only' } },
        { status: 403 }
      )
    }

    // Fetch all pending reviews (approvedAt IS NULL)
    const pendingReviews = await db
      .select()
      .from(reviews)
      .where(isNull(reviews.approvedAt))

    const reviewDtos = pendingReviews.map((r) => ({
      id: r.id,
      jobId: r.jobId,
      reviewerId: r.reviewerId,
      revieweeId: r.revieweeId,
      reviewType: r.reviewType as 'client' | 'provider',
      clientCommunication: r.clientCommunication || undefined,
      clientQuality: r.clientQuality || undefined,
      clientPunctuality: r.clientPunctuality || undefined,
      providerPaymentReliability: r.providerPaymentReliability || undefined,
      providerCommunicationClarity: r.providerCommunicationClarity || undefined,
      providerProfessionalism: r.providerProfessionalism || undefined,
      text: r.text,
      photoUrl: r.photoUrl,
      approvedAt: r.approvedAt ? r.approvedAt.toISOString() : null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }))

    return NextResponse.json({ data: reviewDtos } as ApiSuccessResponse<ReviewDTO[]>)
  }

  // Pattern 1: ?jobId=X (internal use, requires auth)
  if (jobId) {
    const user = await getAuthenticatedUser(req)
    if (!user) return NextResponse.json({ errors: { auth: 'unauthorized' } }, { status: 401 })

    const jobIdNum = parseInt(jobId, 10)
    if (isNaN(jobIdNum)) {
      return NextResponse.json({ errors: { jobId: 'invalid' } }, { status: 400 })
    }

    // Verify user is authorized to view this job's reviews
    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobIdNum)).limit(1)
    if (!job) {
      return NextResponse.json({ errors: { job: 'not_found' } }, { status: 404 })
    }

    const userIdNum = parseInt(user.id, 10)
    if (job.clientId !== userIdNum && job.providerId !== userIdNum) {
      return NextResponse.json(
        { errors: { auth: 'not_authorized' } },
        { status: 403 }
      )
    }

    // Build query based on approved filter
    let jobReviews
    if (approved === 'true') {
      jobReviews = await db
        .select()
        .from(reviews)
        .where(
          and(
            eq(reviews.jobId, jobIdNum),
            isNotNull(reviews.approvedAt)
          )
        )
    } else {
      jobReviews = await db.select().from(reviews).where(eq(reviews.jobId, jobIdNum))
    }

    const reviewDtos = jobReviews.map((r) => ({
      id: r.id,
      jobId: r.jobId,
      reviewerId: r.reviewerId,
      revieweeId: r.revieweeId,
      reviewType: r.reviewType as 'client' | 'provider',
      clientCommunication: r.clientCommunication || undefined,
      clientQuality: r.clientQuality || undefined,
      clientPunctuality: r.clientPunctuality || undefined,
      providerPaymentReliability: r.providerPaymentReliability || undefined,
      providerCommunicationClarity: r.providerCommunicationClarity || undefined,
      providerProfessionalism: r.providerProfessionalism || undefined,
      text: r.text,
      photoUrl: r.photoUrl,
      approvedAt: r.approvedAt ? r.approvedAt.toISOString() : null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }))

    return NextResponse.json({ data: reviewDtos } as ApiSuccessResponse<ReviewDTO[]>)
  }

  // Pattern 2: ?userId=X&approved=true (public profile view)
  if (userId) {
    const userIdNum = parseInt(userId, 10)
    if (isNaN(userIdNum)) {
      return NextResponse.json({ errors: { userId: 'invalid' } }, { status: 400 })
    }

    // For profile views, always filter by approved
    const profileReviews = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.revieweeId, userIdNum),
          isNotNull(reviews.approvedAt)
        )
      )

    // Compute average ratings
    const computeAverages = (revs: typeof profileReviews) => {
      if (revs.length === 0) {
        return {
          communication: 0,
          quality: 0,
          punctuality: 0,
          paymentReliability: 0,
          communicationClarity: 0,
          professionalism: 0,
        }
      }

      let communication = 0, quality = 0, punctuality = 0
      let paymentReliability = 0, communicationClarity = 0, professionalism = 0
      let clientCount = 0, providerCount = 0

      revs.forEach((r) => {
        if (r.reviewType === 'client') {
          if (r.clientCommunication) communication += r.clientCommunication
          if (r.clientQuality) quality += r.clientQuality
          if (r.clientPunctuality) punctuality += r.clientPunctuality
          clientCount++
        } else {
          if (r.providerPaymentReliability) paymentReliability += r.providerPaymentReliability
          if (r.providerCommunicationClarity) communicationClarity += r.providerCommunicationClarity
          if (r.providerProfessionalism) professionalism += r.providerProfessionalism
          providerCount++
        }
      })

      return {
        communication: clientCount > 0 ? communication / clientCount : 0,
        quality: clientCount > 0 ? quality / clientCount : 0,
        punctuality: clientCount > 0 ? punctuality / clientCount : 0,
        paymentReliability: providerCount > 0 ? paymentReliability / providerCount : 0,
        communicationClarity: providerCount > 0 ? communicationClarity / providerCount : 0,
        professionalism: providerCount > 0 ? professionalism / providerCount : 0,
      }
    }

    const averageRatings = computeAverages(profileReviews)

    const reviewDtos = profileReviews.map((r) => ({
      id: r.id,
      jobId: r.jobId,
      reviewerId: r.reviewerId,
      revieweeId: r.revieweeId,
      reviewType: r.reviewType as 'client' | 'provider',
      clientCommunication: r.clientCommunication || undefined,
      clientQuality: r.clientQuality || undefined,
      clientPunctuality: r.clientPunctuality || undefined,
      providerPaymentReliability: r.providerPaymentReliability || undefined,
      providerCommunicationClarity: r.providerCommunicationClarity || undefined,
      providerProfessionalism: r.providerProfessionalism || undefined,
      text: r.text,
      photoUrl: r.photoUrl,
      approvedAt: r.approvedAt ? r.approvedAt.toISOString() : null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }))

    return NextResponse.json({
      data: {
        reviews: reviewDtos,
        averageRatings,
      },
    })
  }

  return NextResponse.json(
    { errors: { query: 'missing_jobId_or_userId' } },
    { status: 400 }
  )
}
