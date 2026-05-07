import { Tabs } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialCommunityIcons name="format-list-bulleted" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="active-jobs"
        options={{
          title: 'Active Jobs',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialCommunityIcons name="briefcase-clock" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialCommunityIcons name="cog" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  )
}
