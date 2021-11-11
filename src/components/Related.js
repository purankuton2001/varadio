import React from 'react';
import {TouchableOpacity} from 'react-native';
import {StyleSheet, View, Text, Image} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Related() {
  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <Image
          source={{uri: 'https://reactjs.org/logo-og.png'}}
          style={styles.image}
        />
        <View style={styles.right}>
          <View style={styles.header}>
            <Text style={styles.username}>信者</Text>
            <Text style={styles.info}>5秒前</Text>
          </View>
          <View style={styles.center}>
            <Text style={styles.description}>
              <Text>私をお救いください。私をお救いください。</Text>
            </Text>
            <View style={styles.rate}>
              <Icon name="heart" size={24} />
              <Text style={styles.rateValue}>300</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Text style={styles.rateValue}>もっと見る</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: 'black',
    shadowOffset: {height: 1},
    shadowOpacity: 0.3,
  },
  item: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomColor: '#A7A7A7',
    borderBottomWidth: 0.5,
  },
  right: {
    flex: 1,
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
  center: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  info: {
    height: 24,
    fontSize: 18,
    color: '#6B6B6B',
  },
  description: {
    height: 48,
    width: 250,
    fontSize: 14,
    color: '#6B6B6B',
  },
  rate: {
    alignItems: 'center',
  },
  rateValue: {
    fontSize: 12,
  },
  image: {
    marginRight: 8,
    borderRadius: 12,
    width: 56,
    height: 56,
    alignSelf: 'center',
  },
});
