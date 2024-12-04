import React from 'react';
import { Snackbar } from 'react-native-paper';
import { useSnackbarStore } from '@/store/snackbarStore';
import { style } from 'd3-selection';
import styles from '@/styles/styles';

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { visible, message, duration, hideSnackbar } = useSnackbarStore();

  return (
    <>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={hideSnackbar}
        duration={duration}
        // action={{
        //   label: 'Dismiss',
        //   onPress: hideSnackbar,
        // }}
		icon={'close'}
		onIconPress={hideSnackbar}
		style={[styles.centeredMaxWidth, styles.slideWidth]}
      >
        {message}
      </Snackbar>
    </>
  );
};

