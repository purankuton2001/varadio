import React from 'react';
import {StyleSheet, View, Text, Image} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ContentsList() {
  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <Image
          source={{uri: 'https://reactjs.org/logo-og.png'}}
          style={styles.image}
        />
        <View style={styles.description}>
          <Text style={styles.title}>コナン君の声真似</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>山田太郎</Text>
            <View style={styles.infoValue}>
              <Icon name="play" size={16} />
              <Text style={styles.infoText}>3000回</Text>
            </View>
            <View style={styles.infoValue}>
              <Icon name="clock-outline" size={16} />
              <Text style={styles.infoText}>2020/01/01</Text>
            </View>
          </View>
        </View>
        <Icon
          name="playlist-plus"
          size={32}
          style={styles.icon}
          color="#A7A7A7"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    position: 'relative',
  },
  item: {
    borderRadius: 24,
    backgroundColor: 'white',
    elevation: 8,
    shadowColor: 'black',
    shadowOffset: {height: 1},
    shadowOpacity: 0.3,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  image: {
    borderRadius: 16,
    width: 72,
    height: 72,
    marginRight: 16,
  },
  description: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    height: 24,
    color: 'black',
    marginBottom: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    height: 16,
  },
  infoText: {
    color: 'black',
    fontSize: 14,
    height: 16,
    marginRight: 8,
  },
  infoValue: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 16,
  },
  icon: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
});
