import React from 'react';
import {StyleSheet, View, Text, Image} from 'react-native';

export default function MessageList() {
  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <Image
          source={{uri: 'https://reactjs.org/logo-og.png'}}
          style={styles.image}
        />
        <View>
          <View style={styles.header}>
            <Text style={styles.username}>信者</Text>
            <Text style={styles.info}>5秒前</Text>
          </View>
          <Text style={styles.description}>
            私をお救いください。私をお救いください。
          </Text>
        </View>
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
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomColor: '#A7A7A7',
    borderBottomWidth: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  username: {
    height: 24,
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold',
  },
  info: {
    height: 24,
    fontSize: 18,
    color: '#6B6B6B',
  },
  description: {
    marginVertical: 8,
    height: 24,
    fontSize: 14,
    color: '#6B6B6B',
  },
  image: {
    marginRight: 8,
    borderRadius: 12,
    width: 56,
    height: 56,
    alignSelf: 'center',
  },
});
