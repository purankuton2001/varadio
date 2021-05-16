import React, {useContext} from 'react';
import {StyleSheet, View, Text, Image, TouchableOpacity} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {PlayerContext} from '../../App';
import {dateToString} from '../utils';
import DraggableFlatList from 'react-native-draggable-flatlist';

export default function ContentsList(props) {
  const {dispatch} = useContext(PlayerContext);
  const {items, iconPress, dragEnd} = props;

  function renderItem({item, index, drag}) {
    const dispatchContents = () => {
      dispatch({type: 'CONTENTSSELECT', items, index});
    };
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={dispatchContents}
        onLongPress={drag}>
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
        <TouchableOpacity
          onPress={() => {
            iconPress(item);
          }}
          style={styles.icon}>
          <Icon name="playlist-plus" size={32} color="#A7A7A7" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }
  return (
    <View style={styles.container}>
      <DraggableFlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        onDragEnd={dragEnd}
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
  icon: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
});
