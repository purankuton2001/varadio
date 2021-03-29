import React from 'react';
import {StyleSheet, View} from 'react-native';
import CommentList from '../components/CommentList';

export default function CommentScreen() {
  return (
    <View style={styles.container}>
      <CommentList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
