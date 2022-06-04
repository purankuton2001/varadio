import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ScrollView,
} from 'react-native';

export default function HomeTopTab({tab, changeTab}) {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.inner} horizontal={true}>
        <TouchableOpacity style={tab !== 'recommend' ? styles.tabContainer:[styles.tabContainer, styles.select]}
                          onPress={() => {changeTab('recommend')}}>
          <Text style={tab !== 'recommend' ? styles.tabText:[styles.tabText, styles.selectText]}>おすすめ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={tab !== 'following' ? styles.tabContainer:[styles.tabContainer, styles.select]}
                          onPress={() => {changeTab('following')}}>
          <Text style={tab !== 'following' ? styles.tabText:[styles.tabText, styles.selectText]}>フォロー中</Text>
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
    paddingHorizontal: 12,
  },
  inner: {
    flex: 1,
  },
  tabContainer: {
    borderRadius: 16,
    marginHorizontal: 8,
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
  selectText: {
    color: 'white',
  },
  select: {
    backgroundColor: '#F2994A',
  },
});
