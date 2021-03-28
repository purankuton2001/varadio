import React from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import ContentsList from '../components/ContentsList';
import Profile from '../components/Profile';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <ScrollView>
        <Profile />
        <ContentsList />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
