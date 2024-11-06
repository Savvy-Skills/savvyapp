import ScreenWrapper from '@/components/screens/ScreenWrapper';
import TfjsComponent from '@/components/TfjsComponent';
import TfjsRegression from '@/components/TFJSRegression';
import React from 'react';

export default function DebugScreen() {
  return (
    <ScreenWrapper style={{ flex: 1 }}>
		<TfjsRegression></TfjsRegression>
    </ScreenWrapper>
  );
}