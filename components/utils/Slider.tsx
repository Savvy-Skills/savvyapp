import React, { useState, useRef } from 'react';
import { View, StyleSheet, PanResponder, Animated, Text } from 'react-native';

interface CustomSliderProps {
    min: number;
    max: number;
    step?: number;
    initialValue?: number;
    onChange?: (value: number) => void;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
    min = 0,
    max = 100,
    step = 1,
    initialValue = min,
    onChange,
}) => {
    const [value, setValue] = useState(initialValue);
    const sliderWidth = useRef(0);
    const pan = useRef(new Animated.Value(0)).current;

    const calculateValue = (positionX: number) => {
        const newValue = Math.round((positionX / sliderWidth.current) * (max - min) / step) * step + min;
        return Math.min(Math.max(newValue, min), max);
    };

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
            const newValue = calculateValue(gestureState.moveX);
            setValue(newValue);
            onChange?.(newValue);
            pan.setValue(gestureState.moveX);
        },
        onPanResponderRelease: () => {
            pan.flattenOffset();
        },
    });

    const handleLayout = (event: any) => {
        sliderWidth.current = event.nativeEvent.layout.width;
        const initialPosition = ((initialValue - min) / (max - min)) * sliderWidth.current;
        pan.setValue(initialPosition);
    };

    return (
        <View style={styles.container} onLayout={handleLayout}>
            <View style={styles.track} {...panResponder.panHandlers}>
                <Animated.View 
                    style={[
                        styles.progress,
                        {
                            width: pan.interpolate({
                                inputRange: [0, sliderWidth.current],
                                outputRange: ['0%', '100%'],
                            }),
                        },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.thumb,
                        {
                            transform: [{ translateX: pan }],
                        },
                    ]}
                />
            </View>
            <Text style={styles.valueText}>{value}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingVertical: 20,
    },
    track: {
        height: 4,
        borderRadius: 2,
        backgroundColor: '#e0e0e0',
        position: 'relative',
    },
    progress: {
        height: '100%',
        backgroundColor: '#007AFF',
        borderRadius: 2,
        position: 'absolute',
    },
    thumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#007AFF',
        position: 'absolute',
        top: -10,
        left: -12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    valueText: {
        marginTop: 8,
        textAlign: 'center',
        fontSize: 16,
        color: '#333',
    },
});

export default CustomSlider;
