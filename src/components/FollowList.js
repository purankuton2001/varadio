import React from 'react';
import {StyleSheet, View, Text, Image, TouchableOpacity} from 'react-native';

export default function FollowList() {
  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <Image
          source={{uri: 'https://reactjs.org/logo-og.png'}}
          style={styles.image}
        />
        <View style={styles.information}>
          <View style={styles.header}>
            <View>
              <Text style={styles.username}>信者</Text>
            </View>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>フォロー</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.id}>@sinja</Text>
          <Text style={styles.textContainer}>
            <Text style={styles.description}>
              私をお救いください。私をお救いください。私をお救いください。
            </Text>
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
  id: {
    height: 16,
    color: '#A7A7A7',
    fontSize: 14,
    marginBottom: 8,
  },
  item: {
    flex: 1,
    flexDirection: 'row',
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
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
  },
  textContainer: {
    width: 200,
    height: 48,
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
  information: {
    flex: 1,
  },
  button: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#F2994A',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  buttonText: {
    fontSize: 12,
    height: 16,
    color: '#F2994A',
  },
});
