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
  if (!jobId || typeof jobId !== 'number') {
    return NextResponse.json({ errors: { jobId: 'required' } }, { status: 400 })
  }

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json({ errors: { text: 'required' } }, { status: 400 })
  }

  if (text.length > 1000) {
    return NextResponse.json({ errors: { text: 'max_1000_chars' } }, { status: 400 })
  }

  // 4. Fetch job to verify existence and status
  const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1)
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

  if (user.role === Role.CLIENT) {
    // Client reviewing provider
    if (String(job.clientId) !== String(user.id)) {
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
    revieweeId = parseInt(job.providerId || '0', 10)
    if (!revieweeId) {
      return NextResponse.json(
        { errors: { job: 'no_provider_assigned' } },
        { status: 400 }
      )
    }

    clientCommunication = clientRating.communication
    clientQuality = clientRating.quality
    clientPunctuality = clientRating.punctuality
  } else if (user.role === Role.PROVIDER) {
    // Provider reviewing client
    if (String(job.providerId) !== String(user.id)) {
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
    revieweeId = parseInt(job.clientId, 10)

    providerPaymentReliability = providerRating.paymentReliability
    providerCommunicationClarity = providerRating.communicationClarity
    providerProfessionalism = providerRating.professionalism
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

    // Validate it's a Vercel Blob URL
    if (!photoUrl.startsWith('https://')) {
      return NextResponse.json(
        { errors: { photoUrl: 'must_be_https' } },
        { status: 400 }
      )
    }

    // For now, accept the URL assuming client-side validated the file
    // In production, you'd fetch the blob headers to verify size/type
    if (photoUrl.length > 500) {
      return NextResponse.json(
        { errors: { photoUrl: 'url_too_long' } },
        { status: 400 }
      )
    }
  }

  // 7. Try inserting review
  try {
    const [newReview] = await db
      .insert(reviews)
      .values({
        jobId,
        reviewerId: userId,
        revieweeId,
        reviewType,
        clientCommunication,
        clientQuality,
        clientPunctuality,
        providerPaymentReliability,
        providerCommunicationClarity,
        providerProfessionalism,
        text: text.trim(),
        photoUrl: photoUrl || null,
        approvedAt: null,
      })
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

    console.error('Review insert error:', error)
    return NextResponse.json(
      { errors: { database: 'insert_failed' } },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  const { isNotNull, and } = await import('drizzle-orm')
  const url = new URL(req.url)
  const jobId = url.searchParams.get('jobId')
  const userId = url.searchParams.get('userId')
  const approved = url.searchParams.get('approved')

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
    if (String(job.clientId) !== String(userIdNum) && String(job.providerId) !== String(userIdNum)) {
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
