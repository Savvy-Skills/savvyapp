import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Text, Button, IconButton, Surface } from 'react-native-paper';
import ColorPicker, {
  Panel1,
  Preview,
  OpacitySlider,
  HueSlider,
  ColorPickerDefaultProps
} from 'reanimated-color-picker';

interface CustomColorPickerProps {
  color: string;
  onColorChange: (color: string) => void;
}

export default function CustomColorPicker({ color, onColorChange }: CustomColorPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempColor, setTempColor] = useState(color);

  const handleColorSelect = ({ hex }: { hex: string }) => {
    setTempColor(hex);
  };

  const confirmColor = () => {
    onColorChange(tempColor);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.colorPreview, { backgroundColor: color }]}
        onPress={() => {
          setTempColor(color);
          setModalVisible(true);
        }}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Surface style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Color</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setModalVisible(false)}
              />
            </View>

            <ColorPicker
              value={color}
              onComplete={handleColorSelect}
              style={styles.colorPicker}
            >
              <Preview style={styles.previewContainer} />
              <Panel1 style={styles.panel} />
              <HueSlider style={styles.sliderContainer} />
              <OpacitySlider style={styles.sliderContainer} />
            </ColorPicker>

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => setModalVisible(false)}
                style={styles.button}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={confirmColor}
                style={styles.button}
              >
                Apply
              </Button>
            </View>
          </Surface>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorPreview: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 8,
    padding: 16,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  colorPicker: {
    width: '100%',
    gap: 16,
  },
  previewContainer: {
    height: 40,
    borderRadius: 8,
  },
  panel: {
    height: 200,
    borderRadius: 8,
  },
  sliderContainer: {
    height: 32,
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 8,
  },
  button: {
    minWidth: 80,
  },
}); 