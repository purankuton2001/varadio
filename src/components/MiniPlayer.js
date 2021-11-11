import React, {useContext} from 'react';
import {StyleSheet, View, Text, Image, TouchableOpacity} from 'react-native';
import {PlayerContext} from '../../App';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function MiniPlayer(props) {
  const {playing, togglePlay, press, style} = props;
  const {state, dispatch} = useContext(PlayerContext);
  const {index, items, likes} = state;
  const item = items[index - 3];

  return (
    <TouchableOpacity style={[styles.miniPlayer, style]} onPress={press}>
      <View style={styles.left}>
        <Image source={{uri: item && item.artwork}} style={styles.image} />
        <Text style={styles.title}>{item && item.title}</Text>
      </View>
      <View style={styles.right}>
        <TouchableOpacity
          style={styles.controllerButton}
          onPress={() => {
            likes !== false
              ? dispatch({type: 'SETLIKE', likes: false})
              : dispatch({type: 'SETLIKE', likes: null});
          }}>
          <Icon
            name="thumb-down"
            size={32}
            color={likes === false ? '#F2994A' : '#A7A7A7'}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.play} onPress={togglePlay}>
          {!playing && <Icon name="play" size={48} color="#F2994A" />}
          {playing && <Icon name="pause" size={48} color="#F2994A" />}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controllerButton}
          onPress={() => {
            !likes
              ? dispatch({type: 'SETLIKE', likes: true})
              : dispatch({type: 'SETLIKE', likes: null});
          }}>
          <Icon
            name="thumb-up"
            size={32}
            color={!likes ? '#A7A7A7' : '#F2994A'}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  miniPlayer: {
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: 'black',
    shadowOffset: {height: 1},
    shadowOpacity: 0.3,
    left: 0,
    right: 0,
    flexDirection: 'row',
    position: 'absolute',
    zIndex: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    height: 24,
    fontWeight: 'bold',
  },
  play: {marginHorizontal: 8},
  image: {
    width: 72,
    height: 72,
    marginRight: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  right: {
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
