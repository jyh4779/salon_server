import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function ColdStartCTA() {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#2A2A2A', '#1F1F1F']}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    <Text style={styles.title}>아직 정착한 샵이 없으신가요?</Text>
                    <Text style={styles.subtitle}>나에게 딱 맞는 인생 샵을 찾아보세요.</Text>

                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>내 주변 샵 검색하기</Text>
                        <Ionicons name="search" size={18} color="white" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#333',
        overflow: 'hidden',
        // Optional: Add Hot Pink border as per request "선택 사항" but image shows purple-ish glow.
        // Let's add a subtle pink glow effect via shadow or border if needed.
        // For now subtle dark border is fine, maybe slightly pink tint.
        shadowColor: '#FF0099',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    gradient: {
        padding: 24,
        paddingVertical: 30,
    },
    content: {
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: '#CCC',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#FF0099',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        width: '100%',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
