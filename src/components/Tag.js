import React from 'react';
import {StyleSheet, TouchableOpacity, View, Text, Image} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Tag() {
  return (
    <View style={styles.container}>
      <Image
        source={{uri: 'https://reactjs.org/logo-og.png'}}
        style={styles.image}
      />
      <Text style={styles.username}>神様</Text>
      <Text style={styles.description}>私は神です。信仰してください</Text>
      <TouchableOpacity style={styles.play}>
        <Icon name="play" size={48} color="white" />
      </TouchableOpacity>
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
    paddingVertical: 24,
    alignItems: 'center',
  },
  image: {
    width: 96,
    height: 96,
    marginBottom: 8,
    borderRadius: 24,
  },
  username: {
    marginBottom: 4,
    height: 24,
    fontSize: 18,
    fontWeight: 'bold',
  },
  play: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F2994A',
    padding: 12,
  },
  description: {
    height: 16,
    fontSize: 14,
    marginVertical: 24,
  },
});
