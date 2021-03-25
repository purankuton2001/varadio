import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
} from 'react-native';

export default function HomeTopTab() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.inner} horizontal={true}>
        <TouchableOpacity style={[styles.tabContainer, styles.select]}>
          <Text style={[styles.tabText, styles.select]}>おすすめ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabContainer}>
          <Text style={styles.tabText}>フォロー中</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabContainer}>
          <Text style={styles.tabText}>神様</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabContainer}>
          <Text style={styles.tabText}>まんざい</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    width: '100%',
    backgroundColor: 'white',
    elevation: 8,
    shadowColor: 'black',
    shadowOffset: {height: 1},
    shadowOpacity: 0.3,
  },
  inner: {
    flex: 1,
  },
  tabContainer: {
    borderRadius: 16,
    margin: 16,
    marginVertical: 8,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tabText: {
    alignSelf: 'center',
    fontSize: 18,
    height: 24,
    color: 'black',
  },
  select: {
    color: 'white',
    backgroundColor: '#F2994A',
  },
});
