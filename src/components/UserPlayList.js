/* eslint-disable react-native/no-inline-styles */
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {dateToString} from '../utils';

export default function UserPlayList(props) {
  const navigation = useNavigation();
  const {playLists} = props;
  function renderItem({item}) {
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          navigation.navigate('PlayList', {item});
        }}>
        <Image source={{uri: item.artwork}} style={styles.image} />
        <View style={styles.description}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.infoText}>{item.artist.name}</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoValue}>
              <Icon name="play" size={16} />
              <Text style={styles.infoText}>3000回</Text>
            </View>
            <View style={styles.infoValue}>
              <Icon name="clock-outline" size={16} />
              <Text style={styles.infoText}>{dateToString(item.date)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.create}
        onPress={() => {
          navigation.navigate('PlayListCreate');
        }}>
        <Icon name="plus" size={72} style={{marginRight: 16}} />
        <Text style={styles.createText}>新しいプレイリストを作成</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.create}
        onPress={() => {
          navigation.navigate('likes');
        }}>
        <Icon name="thumb-up" size={72} style={{marginRight: 16}} />
        <Text style={styles.createText}>いいねした投稿</Text>
      </TouchableOpacity>
      <FlatList
        nestedScrollEnabled={true}
        scrollEnabled={false}
        data={playLists}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    position: 'relative',
    paddingBottom: 80,
  },
  create: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: 'black',
    shadowOffset: {height: 1},
    shadowOpacity: 0.3,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'white',
  },
  item: {
    borderRadius: 16,
    backgroundColor: 'white',
    elevation: 2,
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
  createText: {
    fontSize: 16,
    fontWeight: 'bold',
    height: 24,
    color: 'black',
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
    fontSize: 13,
    height: 16,
    marginRight: 8,
  },
  infoValue: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 16,
  },
});
