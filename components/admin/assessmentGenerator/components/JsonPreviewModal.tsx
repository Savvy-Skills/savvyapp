import React from 'react';
import { View, ScrollView } from 'react-native';
import { Surface, Text, IconButton, Button, Divider, Portal, Modal } from 'react-native-paper';
import { JsonPreviewModalProps } from '../types';
import { styles } from '../styles';

const JsonPreviewModal = ({ visible, onDismiss, jsonData, handleCopyJson }: JsonPreviewModalProps) => (
  <Portal>
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={styles.modalContainer}
    >
      <Surface style={styles.jsonModal}>
        <View style={styles.jsonHeader}>
          <Text variant="titleLarge">Assessment JSON Data</Text>
          <IconButton icon="close" onPress={onDismiss} />
        </View>
        <Divider style={styles.modalDivider} />
        <ScrollView style={styles.jsonScrollView}>
          <View style={styles.jsonContent}>
            <Button 
              mode="contained" 
              onPress={handleCopyJson} 
              icon="content-copy"
              style={styles.copyButton}
            >
              Copy to Clipboard
            </Button>
            <View style={styles.jsonTextContainer}>
              <Text selectable style={styles.jsonText}>{jsonData}</Text>
            </View>
          </View>
        </ScrollView>
      </Surface>
    </Modal>
  </Portal>
);

export default JsonPreviewModal; 