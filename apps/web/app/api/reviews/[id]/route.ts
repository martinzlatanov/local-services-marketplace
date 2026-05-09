import { NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { reviews } from '@/lib/db/schema'
import { getAuthenticatedUser } from '@/lib/auth'
import { ReviewDTO, ApiSuccessResponse, ApiErrorResponse, Role } from '@/lib/types'
import { eq } from 'drizzle-orm'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // 1. Fetch review by id
  const { id } = await params
  const reviewId = parseInt(id, 10)
  if (isNaN(reviewId)) {
    return NextResponse.json({ errors: { id: 'invalid' } }, { status: 400 })
  }

  const [review] = await db.select().from(reviews).where(eq(reviews.id, reviewId)).limit(1)
  if (!review) {
    return NextResponse.json({ errors: { review: 'not_found' } }, { status: 404 })
  }

  // 2. Check if review is pending (approvedAt is null)
  if (review.approvedAt === null) {
    // Only allow access to reviewer or admin
    const user = await getAuthenticatedUser(req)
    if (!user) return NextResponse.json({ errors: { auth: 'unauthorized' } }, { status: 401 })

    const userId = parseInt(user.id, 10)
    const isReviewer = review.reviewerId === userId
    const isAdmin = user.role === Role.ADMIN

    if (!isReviewer && !isAdmin) {
      return NextResponse.json(
        { errors: { auth: 'not_authorized' } },
        { status: 403 }
      )
    }
  }

  // 3. Return full review object
  const reviewDto: ReviewDTO = {
    id: review.id,
    jobId: review.jobId,
    reviewerId: review.reviewerId,
    revieweeId: review.revieweeId,
    reviewType: review.reviewType as 'client' | 'provider',
    clientCommunication: review.clientCommunication || undefined,
    clientQuality: review.clientQuality || undefined,
    clientPunctuality: review.clientPunctuality || undefined,
    providerPaymentReliability: review.providerPaymentReliability || undefined,
    providerCommunicationClarity: review.providerCommunicationClarity || undefined,
    providerProfessionalism: review.providerProfessionalism || undefined,
    text: review.text,
    photoUrl: review.photoUrl,
    approvedAt: review.approvedAt ? review.approvedAt.toISOString() : null,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  }

  return NextResponse.json({ data: reviewDto } as ApiSuccessResponse<ReviewDTO>)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // 1. Authenticate user
  const user = await getAuthenticatedUser(req)
  if (!user) return NextResponse.json({ errors: { auth: 'unauthorized' } }, { status: 401 })

  // 2. Parse review id
  const { id } = await params
  const reviewId = parseInt(id, 10)
  if (isNaN(reviewId)) {
    return NextResponse.json({ errors: { id: 'invalid' } }, { status: 400 })
  }

  // 3. Fetch review
  const [review] = await db.select().from(reviews).where(eq(reviews.id, reviewId)).limit(1)
  if (!review) {
    return NextResponse.json({ errors: { review: 'not_found' } }, { status: 404 })
  }

  // 4. Verify user is the review author
  const userId = parseInt(user.id, 10)
  if (review.reviewerId !== userId) {
    return NextResponse.json(
      { errors: { auth: 'not_author' } },
      { status: 403 }
    )
  }

  // 5. Verify review is pending (not approved)
  if (review.approvedAt !== null) {
    return NextResponse.json(
      { errors: { review: 'already_approved' } },
      { status: 403 }
    )
  }

  // 6. Delete the review
  await db.delete(reviews).where(eq(reviews.id, reviewId))

  // 7. Return 204 No Content
  return new NextResponse(null, { status: 204 })
}
