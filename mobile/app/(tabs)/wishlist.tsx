import { View, Text, StyleSheet } from 'react-native';

export default function WishlistScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>찜한 목록</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1A1A1A',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
});
