import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import HomeHeader from '@/components/HomeHeader';
import ColdStartCTA from '@/components/ColdStartCTA';
import CategoryGrid from '@/components/CategoryGrid';
import TuningGallery from '@/components/TuningGallery';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <HomeHeader />

        {/* Cold Start CTA with some spacing */}
        <View style={styles.section}>
          <ColdStartCTA />
        </View>

        {/* Categories */}
        <CategoryGrid />

        {/* Gallery */}
        <TuningGallery />

        {/* Bottom Padding for TabBar */}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  scrollContent: {
    flexGrow: 1,
  },
  section: {
    marginTop: 10,
  }
});
