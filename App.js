import React from 'react';
import {StyleSheet, View} from 'react-native';

import CommentScreen from './src/screens/CommentScreen';

export default function App() {
  return (
    <View style={styles.container}>
      <CommentScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
