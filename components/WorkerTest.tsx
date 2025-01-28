import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { Button } from 'react-native-paper';
import { workerScript } from '@/utils/worker';
import { DatasetInfo } from '@/types';

const WorkerTest = () => {
	const workerRef = useRef<Worker | null>(null);
	useEffect(() => {
		if (!workerRef.current) {
			workerRef.current = new Worker(workerScript);
		}
	}, []);

	return (
		<View>
			<Text>WorkerTest</Text>
			<Button onPress={() => {
				workerRef.current?.postMessage({ type: "test" });
			}}>
				Test
			</Button>
		</View>
	)
}

export default WorkerTest

const styles = StyleSheet.create({})