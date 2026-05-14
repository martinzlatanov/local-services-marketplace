import { Avatar } from 'react-native-paper'

interface AvatarInitialsProps {
  name: string | null
  email: string
  avatarUrl: string | null
  size: number
}

export default function AvatarInitials({ name, email, avatarUrl, size }: AvatarInitialsProps) {
  const trimmedName = name?.trim() ?? ''
  const trimmedEmail = email?.trim() ?? ''
  const initials = trimmedName
    ? trimmedName.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : (trimmedEmail[0]?.toUpperCase() ?? '?')

  if (avatarUrl) {
    return <Avatar.Image size={size} source={{ uri: avatarUrl }} />
  }

  return <Avatar.Text size={size} label={initials} />
}
