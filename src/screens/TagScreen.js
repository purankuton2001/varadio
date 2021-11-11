import React from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import ContentsList from '../components/ContentsList';
import Tag from '../components/Tag';

export default function TagScreen() {
  return (
    <View style={styles.container}>
      <ScrollView>
        <Tag />
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
