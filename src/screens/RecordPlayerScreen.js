import React from 'react';
import {StyleSheet, View} from 'react-native';
import RecordPlayer from '../components/RecordPlayer';

export default function RecordPlayerScreen() {
  return (
    <View style={styles.container}>
      <RecordPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
