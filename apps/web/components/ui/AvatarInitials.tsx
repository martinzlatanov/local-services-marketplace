interface AvatarInitialsProps {
  name: string | null
  email: string
  avatarUrl: string | null
  size: 'sm' | 'lg'
}

export default function AvatarInitials({ name, email, avatarUrl, size }: AvatarInitialsProps) {
  const initials = name
    ? name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : email[0].toUpperCase()

  const dimensions = size === 'sm' ? 'w-8 h-8 text-[12px]' : 'w-20 h-20 text-[28px]'

  if (avatarUrl) {
    return <img src={avatarUrl} className={`${dimensions} rounded-full object-cover`} alt="" aria-hidden="true" />
  }

  return (
    <div className={`${dimensions} rounded-full bg-surface-900 text-surface-0 flex items-center justify-center font-semibold select-none`}>
      {initials}
    </div>
  )
}
