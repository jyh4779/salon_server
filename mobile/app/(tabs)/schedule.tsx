import { View, Text, StyleSheet } from 'react-native';

export default function ScheduleScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>예약 내역</Text>
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
