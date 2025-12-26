import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GalleryApi } from '../services/api';

interface GalleryItem {
    id: number;
    title: string;
    shop: string;
    image: string;
}

const EXAMPLES: GalleryItem[] = [
    { id: 1, title: '성형컷 매직 (예시)', shop: 'V-Salon 역삼점', image: 'https://picsum.photos/300/500?random=1' },
    { id: 2, title: '물광 수분 케어 (예시)', shop: 'Skin Lab 청담', image: 'https://picsum.photos/300/500?random=2' },
    { id: 3, title: '애쉬 그레이 염색 (예시)', shop: 'Color Full', image: 'https://picsum.photos/300/500?random=3' },
];

const getImageUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/300';
    if (url.startsWith('http')) {
        // If it's already a full URL, just return it (unless we need to rewrite it)
        return url;
    }

    // For relative paths, point to the Cloud Server's static file server
    // Assuming the cloud server serves uploads at the root or under the same path structure
    // If the path stored in DB is like "uploads/..." or "/uploads/..."

    const CLOUD_SERVER_IP = 'http://168.107.15.242'; // Port 80 generic
    // If the path doesn't start with /, add it
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;

    return `${CLOUD_SERVER_IP}${normalizedPath}`;
};

export default function TuningGallery() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGallery();
    }, []);

    const loadGallery = async () => {
        try {
            const data = await GalleryApi.getRecent();
            console.log('Gallery Data:', data);
            if (data && data.length > 0) {
                setItems(data);
            } else {
                console.log('No data from API, using fallback.');
                setItems(EXAMPLES); // Fallback to mocks
            }
        } catch (error) {
            console.error('Failed to load gallery', error);
            setItems(EXAMPLES); // Fallback to mocks on error
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator color="#FF0099" />
            </View>
        );
    }

    // Should always have items now due to fallback
    if (!items || items.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>미모 튜닝 성공 사례 🔥</Text>
                <TouchableOpacity>
                    <Text style={styles.more}>전체보기</Text>
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {items.map((item) => (
                    <TouchableOpacity key={item.id} style={styles.card}>
                        <Image
                            source={{ uri: getImageUrl(item.image) }}
                            style={styles.image}
                            resizeMode="cover"
                        />

                        {/* Before / After Label */}
                        <View style={styles.labelContainer}>
                            <Text style={styles.labelText}>Before / After</Text>
                        </View>

                        {/* Bottom Gradient & Text */}
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.8)']}
                            style={styles.textOverlay}
                        >
                            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                            <Text style={styles.cardShop} numberOfLines={1}>{item.shop}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        marginBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    title: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    more: {
        color: '#888',
        fontSize: 14,
    },
    scrollContent: {
        paddingHorizontal: 20,
        gap: 15,
    },
    card: {
        width: 160,
        height: 240, // Instagram Story Ratio-ish
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#333',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    labelContainer: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: '#FF0099',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    labelText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    textOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 15,
        paddingTop: 40,
    },
    cardTitle: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    cardShop: {
        color: '#CCC',
        fontSize: 12,
    },
});
