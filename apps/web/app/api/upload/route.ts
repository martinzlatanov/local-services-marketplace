import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'

export async function POST(req: Request) {
  // 1. Authenticate user
  const user = await getAuthenticatedUser(req)
  if (!user) return NextResponse.json({ errors: { auth: 'unauthorized' } }, { status: 401 })

  // 2. Parse form data
  const formData = await req.formData().catch(() => null)
  if (!formData) {
    return NextResponse.json({ errors: { body: 'invalid_form_data' } }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ errors: { file: 'missing' } }, { status: 400 })
  }

  // 3. Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return NextResponse.json(
      { errors: { file: 'invalid_type' } },
      { status: 400 }
    )
  }

  // 4. Validate file size (< 5 MB)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { errors: { file: 'too_large' } },
      { status: 400 }
    )
  }

  try {
    // 5. Convert file to buffer
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)

    // 6. For MVP, store as data URL (in production, use Vercel Blob)
    // Convert to base64 for simple storage
    let binaryString = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binaryString += String.fromCharCode(bytes[i])
    }
    const base64 = Buffer.from(binaryString, 'binary').toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    // 7. Return success with URL
    // In production, this would return a Vercel Blob URL
    return NextResponse.json({
      data: {
        url: dataUrl,
        filename: file.name,
        size: file.size,
      },
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { errors: { upload: 'failed' } },
      { status: 500 }
    )
  }
}
