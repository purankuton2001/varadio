import React from 'react';
import {StyleSheet, View} from 'react-native';

import ProfileScreen from './src/screens/ProfileScreen';

export default function App() {
  return (
    <View style={styles.container}>
      <ProfileScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
