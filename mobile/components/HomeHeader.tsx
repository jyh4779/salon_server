import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge } from 'react-native-paper';

export default function HomeHeader() {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity style={styles.locationContainer}>
                <Text style={styles.locationText}>역삼동</Text>
                <Ionicons name="chevron-down" size={20} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconContainer}>
                <Ionicons name="notifications" size={24} color="white" />
                <Badge size={8} style={styles.badge} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#1A1A1A',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    iconContainer: {
        position: 'relative',
        padding: 4,
    },
    badge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#FF0099',
    },
});
