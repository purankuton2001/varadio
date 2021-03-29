import React from 'react';
import {StyleSheet, ScrollView} from 'react-native';
import MessageList from '../components/MessageList';

export default function NotificationScreen() {
  return (
    <ScrollView style={styles.container}>
      <MessageList />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
