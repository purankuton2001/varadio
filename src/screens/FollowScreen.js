import React from 'react';
import {StyleSheet, ScrollView} from 'react-native';
import FollowList from '../components/FollowList';

export default function FollowScreen() {
  return (
    <ScrollView style={styles.container}>
      <FollowList />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
