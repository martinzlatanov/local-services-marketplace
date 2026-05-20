import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, HelperText, RadioButton, Text } from 'react-native-paper'
import { CITY_AREAS } from '@local/types'
import { useServiceArea } from '../../contexts/ServiceAreaContext'

export default function OnboardingScreen() {
  const { saveServiceArea } = useServiceArea()
  const [selected, setSelected] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSave = Boolean(selected) && !isSaving

  async function handleSave() {
    if (!selected || isSaving) {
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      await saveServiceArea(selected)
      // Navigation is handled by NavigationGuard in _layout.tsx once
      // serviceArea state updates — avoids a race where router.replace fires
      // before the context state has propagated, causing a redirect loop.
    } catch {
      setError("Couldn't save your area. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.heading}>
        Choose your service area
      </Text>
      <Text variant="bodyLarge" style={styles.helper}>
        We'll show you jobs posted in this area.
      </Text>

      <RadioButton.Group value={selected ?? ''} onValueChange={value => setSelected(value)}>
        {CITY_AREAS.map(area => (
          <RadioButton.Item key={area} label={area} value={area} style={styles.radioItem} />
        ))}
      </RadioButton.Group>

      {error ? <HelperText type="error">{error}</HelperText> : null}

      <Button
        mode="contained"
        onPress={handleSave}
        disabled={!canSave}
        loading={isSaving}
        style={styles.saveButton}
        contentStyle={styles.saveButtonContent}
      >
        {isSaving ? 'Saving...' : 'Save area'}
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  heading: {
    marginBottom: 12,
    fontWeight: '600',
  },
  helper: {
    marginBottom: 24,
  },
  radioItem: {
    minHeight: 44,
  },
  saveButton: {
    marginTop: 24,
  },
  saveButtonContent: {
    minHeight: 44,
  },
})
