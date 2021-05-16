import React from 'react';
import {StyleSheet, View, Text, Image, ScrollView} from 'react-native';

export default function NotificationList() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.item}>
        <View style={styles.header}>
          <View style={styles.itemList}>
            <Image
              source={{uri: 'https://reactjs.org/logo-og.png'}}
              style={styles.image}
            />
          </View>
          <Text style={styles.infoText}>5秒前</Text>
        </View>
        <Text style={styles.desccription}>
          神様さんがあなたをフォローしました。
        </Text>
      </View>
    </ScrollView>
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
    height: 24,
    fontSize: 18,
    color: 'black',
  },
  infoValue: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 16,
  },
  itemList: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoText: {
    height: 24,
    fontSize: 18,
    color: '#6B6B6B',
  },
  image: {
    borderRadius: 12,
    width: 40,
    height: 40,
    marginRight: 16,
  },
});
