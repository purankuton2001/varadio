import React from 'react';
import {StyleSheet, View} from 'react-native';
import RecordDescription from '../components/RecordDescription';

export default function RecordDescriptionScreen() {
  return (
    <View style={styles.container}>
      <RecordDescription />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
