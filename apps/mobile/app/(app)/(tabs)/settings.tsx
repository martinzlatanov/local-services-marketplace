import { useEffect, useState } from 'react'
import { Modal, ScrollView, StyleSheet, TouchableOpacity, Pressable, View } from 'react-native'
import { Appbar, Button, List, Text, useTheme } from 'react-native-paper'
import { CITY_AREAS } from '@local/types'
import { useAuth } from '../../../contexts/AuthContext'
import { useServiceArea } from '../../../hooks/useServiceArea'

export default function SettingsScreen() {
  const { user, logout } = useAuth()
  const { serviceArea, saveServiceArea } = useServiceArea()
  const theme = useTheme()
  const [areaModalVisible, setAreaModalVisible] = useState(false)
  const [tempArea, setTempArea] = useState<string>(serviceArea ?? '')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setTempArea(serviceArea ?? '')
  }, [serviceArea])

  async function handleUpdateArea() {
    if (!tempArea || isSaving) {
      return
    }

    setIsSaving(true)
    await saveServiceArea(tempArea)
    setIsSaving(false)
    setAreaModalVisible(false)
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
          onPress={() => setAreaModalVisible(true)}
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

      <Modal
        visible={areaModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAreaModalVisible(false)}
      >
        <Pressable style={settingsStyles.overlay} onPress={() => setAreaModalVisible(false)} />
        <View style={settingsStyles.sheet}>
          <View style={settingsStyles.handle} />
          <Text style={settingsStyles.sheetTitle}>Select Service Area</Text>
          <ScrollView>
            {CITY_AREAS.map((area) => (
              <TouchableOpacity
                key={area}
                style={[settingsStyles.areaRow, tempArea === area && settingsStyles.areaRowActive]}
                onPress={() => setTempArea(area)}
              >
                <Text style={[settingsStyles.areaLabel, tempArea === area && settingsStyles.areaLabelActive]}>
                  {area}
                </Text>
                {tempArea === area && <Text style={{ color: '#14b8a6', fontWeight: 'bold' }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={settingsStyles.sheetActions}>
            <TouchableOpacity onPress={() => setAreaModalVisible(false)} style={settingsStyles.cancelBtn}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleUpdateArea} style={settingsStyles.updateBtn}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  logoutContainer: {
    paddingHorizontal: 16,
  },
})

const settingsStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  areaRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  areaRowActive: { backgroundColor: '#0f172a', paddingHorizontal: 8, borderRadius: 6 },
  areaLabel: { fontSize: 14 },
  areaLabelActive: { color: '#fff', fontWeight: '600' },
  sheetActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  updateBtn: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
})
