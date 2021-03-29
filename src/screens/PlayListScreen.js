import React from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import ContentsList from '../components/ContentsList';
import PlayList from '../components/PlayList';

export default function PlayListScreen() {
  return (
    <View style={styles.container}>
      <ScrollView>
        <PlayList />
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
