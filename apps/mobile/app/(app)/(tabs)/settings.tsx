import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Appbar, Button, Dialog, List, Portal, RadioButton, useTheme } from 'react-native-paper'
import { CITY_AREAS } from '@local/types'
import { useAuth } from '../../../contexts/AuthContext'
import { useServiceArea } from '../../../hooks/useServiceArea'

export default function SettingsScreen() {
  const { user, logout } = useAuth()
  const { serviceArea, saveServiceArea } = useServiceArea()
  const theme = useTheme()
  const [dialogVisible, setDialogVisible] = useState(false)
  const [selectedArea, setSelectedArea] = useState<string | null>(serviceArea ?? null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setSelectedArea(serviceArea ?? null)
  }, [serviceArea])

  async function handleUpdateArea() {
    if (!selectedArea || isSaving) {
      return
    }

    setIsSaving(true)
    await saveServiceArea(selectedArea)
    setIsSaving(false)
    setDialogVisible(false)
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Settings" />
      </Appbar.Header>

      <List.Section>
        <List.Subheader>Service Area</List.Subheader>
        <List.Item
          title={serviceArea ?? ''}
          description="Tap to change"
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => setDialogVisible(true)}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>Account</List.Subheader>
        <List.Item title={user?.email ?? ''} disabled />
      </List.Section>

      <View style={styles.logoutContainer}>
        <Button mode="text" textColor={theme.colors.error} onPress={logout}>
          Log out
        </Button>
      </View>

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Choose your service area</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              value={selectedArea ?? ''}
              onValueChange={value => setSelectedArea(value)}
            >
              {CITY_AREAS.map(area => (
                <RadioButton.Item key={area} label={area} value={area} style={styles.radioItem} />
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Keep current area</Button>
            <Button onPress={handleUpdateArea} loading={isSaving} disabled={!selectedArea || isSaving}>
              Update area
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  logoutContainer: {
    paddingHorizontal: 16,
  },
  radioItem: {
    minHeight: 44,
  },
})
