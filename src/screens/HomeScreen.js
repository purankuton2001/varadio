import React from 'react';
import {StyleSheet, View} from 'react-native';
import RecordEdit from '../components/RecordEdit';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <RecordEdit />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
