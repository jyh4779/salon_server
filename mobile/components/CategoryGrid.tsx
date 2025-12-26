import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CATEGORIES = [
    { id: 'hair', name: '헤어', icon: 'scissors-cutting' },
    { id: 'nail', name: '네일', icon: 'brush' }, // or 'nail' if available, 'brush' generic
    { id: 'aesthetic', name: '에스테틱', icon: 'flower-tulip' }, // or 'spa'
    { id: 'barber', name: '바버', icon: 'face-man' },
    { id: 'eyelash', name: '속눈썹', icon: 'eye-outline' },
];

export default function CategoryGrid() {
    return (
        <View style={styles.container}>
            {CATEGORIES.map((cat) => (
                <TouchableOpacity key={cat.id} style={styles.item}>
                    <View style={styles.iconBox}>
                        <MaterialCommunityIcons name={cat.icon as any} size={28} color="white" />
                    </View>
                    <Text style={styles.label}>{cat.name}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 30,
        marginBottom: 20,
    },
    item: {
        alignItems: 'center',
        flex: 1,
    },
    iconBox: {
        width: 60,
        height: 60,
        borderRadius: 20,
        backgroundColor: '#2A2A2A',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    label: {
        color: '#CCC',
        fontSize: 12,
        fontWeight: '500',
    },
});
