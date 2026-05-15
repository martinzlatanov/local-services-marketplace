import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { reviews } from '@/lib/db/schema'
import { getAuthenticatedUser } from '@/lib/auth'
import { ReviewDTO, ApiSuccessResponse, ApiErrorResponse, Role } from '@/lib/types'
import { eq } from 'drizzle-orm'
import { broadcastToUser } from '@/lib/ws/server'

export async function POST(req: Request) {
  // 1. Authenticate user and verify admin role
  const user = await getAuthenticatedUser(req)
  if (!user) return NextResponse.json({ errors: { auth: 'unauthorized' } }, { status: 401 })

  if (!user.roles.includes(Role.ADMIN)) {
    return NextResponse.json(
      { errors: { role: 'admin_only' } },
      { status: 403 }
    )
  }

  // 2. Parse request body
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ errors: { body: 'invalid_json' } }, { status: 400 })

  const { reviewId } = body as any

  // 3. Validate reviewId
  if (!reviewId || typeof reviewId !== 'number') {
    return NextResponse.json({ errors: { reviewId: 'required' } }, { status: 400 })
  }

  // 4. Fetch review by id
  const [review] = await db.select().from(reviews).where(eq(reviews.id, reviewId)).limit(1)
  if (!review) {
    return NextResponse.json({ errors: { review: 'not_found' } }, { status: 404 })
  }

  // 5. Verify review is not already approved
  if (review.approvedAt !== null) {
    return NextResponse.json(
      { errors: { review: 'already_approved' } },
      { status: 409 }
    )
  }

  // 6. Update review: set approvedAt to now()
  const [updatedReview] = await db
    .update(reviews)
    .set({ approvedAt: new Date() })
    .where(eq(reviews.id, reviewId))
    .returning()

  // 6a. Emit WebSocket 'review_approved' event to revieweeId (fire-and-forget)
  try {
    const revieweeIdStr = String(updatedReview.revieweeId)
    broadcastToUser(revieweeIdStr, {
      type: 'review_approved',
      payload: {
        reviewId: updatedReview.id,
        revieweeId: updatedReview.revieweeId,
        reviewerName: `User ${updatedReview.reviewerId}`,
      },
    })
  } catch (wsError) {
    // Log but don't fail the request - WebSocket is fire-and-forget
    console.error('WebSocket broadcast error:', wsError)
  }

  // 7. Return 200 + updated review
  const reviewDto: ReviewDTO = {
    id: updatedReview.id,
    jobId: updatedReview.jobId,
    reviewerId: updatedReview.reviewerId,
    revieweeId: updatedReview.revieweeId,
    reviewType: updatedReview.reviewType as 'client' | 'provider',
    clientCommunication: updatedReview.clientCommunication || undefined,
    clientQuality: updatedReview.clientQuality || undefined,
    clientPunctuality: updatedReview.clientPunctuality || undefined,
    providerPaymentReliability: updatedReview.providerPaymentReliability || undefined,
    providerCommunicationClarity: updatedReview.providerCommunicationClarity || undefined,
    providerProfessionalism: updatedReview.providerProfessionalism || undefined,
    text: updatedReview.text,
    photoUrl: updatedReview.photoUrl,
    approvedAt: updatedReview.approvedAt ? updatedReview.approvedAt.toISOString() : null,
    createdAt: updatedReview.createdAt.toISOString(),
    updatedAt: updatedReview.updatedAt.toISOString(),
  }

  return NextResponse.json(
    { data: reviewDto } as ApiSuccessResponse<ReviewDTO>,
    { status: 200 }
  )
}
