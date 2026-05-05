import { StatusBar } from 'expo-status-bar'
import { Text, View } from 'react-native'
import { JobStatus } from '@local/types'

export default function App() {
  const initialStatus: JobStatus = JobStatus.PENDING
  return (
    <View>
      <Text>Local Services Provider</Text>
      <Text>Default status: {initialStatus}</Text>
      <StatusBar style="auto" />
    </View>
  )
}
