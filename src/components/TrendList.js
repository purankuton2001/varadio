import React from 'react';
import {StyleSheet, View, Text, Image, ScrollView} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TrendList() {
  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <View style={styles.header}>
          <Text style={styles.title}>声真似集</Text>
          <View style={styles.infoValue}>
            <Icon name="play" size={16} />
            <Text style={styles.infoText}>3000回</Text>
          </View>
        </View>
        <ScrollView style={styles.itemList} horizontal>
          <Image
            source={{uri: 'https://reactjs.org/logo-og.png'}}
            style={styles.image}
          />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  item: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomColor: '#A7A7A7',
    borderBottomWidth: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    height: 28,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  infoValue: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 16,
  },
  itemList: {
    marginTop: 24,
  },
  image: {
    borderRadius: 24,
    width: 80,
    height: 80,
    marginRight: 16,
  },
});
