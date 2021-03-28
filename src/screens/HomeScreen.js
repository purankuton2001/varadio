import React from 'react';
import {StyleSheet, View} from 'react-native';
import HomeTopTab from '../components/HomeTopTab';
import ContentsList from '../components/ContentsList';
import PlayList from '../components/PlayList ';
import {ScrollView} from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <HomeTopTab />
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
