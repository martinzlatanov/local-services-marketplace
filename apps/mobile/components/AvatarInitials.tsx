import { Avatar } from 'react-native-paper'

interface AvatarInitialsProps {
  name: string | null
  email: string
  avatarUrl: string | null
  size: number
}

export default function AvatarInitials({ name, email, avatarUrl, size }: AvatarInitialsProps) {
  const initials = name
    ? name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : email[0].toUpperCase()

  if (avatarUrl) {
    return <Avatar.Image size={size} source={{ uri: avatarUrl }} />
  }

  return <Avatar.Text size={size} label={initials} />
}
