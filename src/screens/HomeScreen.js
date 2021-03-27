import React from 'react';
import {StyleSheet, View} from 'react-native';
import HomeTopTab from '../components/HomeTopTab';
import ContentsList from '../components/ContentsList';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <HomeTopTab />
      <ContentsList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
