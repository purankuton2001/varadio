/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useContext, useEffect} from 'react';
import {StyleSheet, TouchableOpacity, View, Text, Image} from 'react-native';
import {PlayerContext} from '../../App';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TrackPlayer, {
  TrackPlayerEvents,
  useTrackPlayerEvents,
  STATE_PLAYING,
} from 'react-native-track-player';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import SoundPlayer from 'react-native-sound-player';

const events = [
  TrackPlayerEvents.PLAYBACK_STATE,
  TrackPlayerEvents.PLAYBACK_ERROR,
];

export default function RecordPlayerScreen(props) {
  const [playerState, setPlayerState] = useState(null);
  const {state, dispatch} = useContext(PlayerContext);
  const {index, items, likes} = state;
  const item = items[index - 3];
  useEffect(() => {
    const likeRef = firestore()
      .collection(`users/${auth().currentUser.uid}/likes`)
      .doc(item && item.id);
    const dislikeRef = firestore()
      .collection(`users/${auth().currentUser.uid}/dislikes`)
      .doc(item && item.id);
    switch (likes) {
      case false:
        likeRef.delete();
        dislikeRef.set({
          duration: item.duration,
          records: item.records,
          isComment: item.isComment,
          url: item.url,
          genre: item.genre,
          title: item.title,
          artwork: item.artwork,
          date: item.date,
          postRange: item.postRange,
          materialRange: item.materialRange,
          artist: firestore().collection('users').doc(item.artist.id),
          tags: item.tags,
        });
        SoundPlayer.playSoundFile('dislike', 'mp3');
        break;
      case true:
        dislikeRef.delete();
        likeRef.set({
          duration: item.duration,
          records: item.records,
          isComment: item.isComment,
          url: item.url,
          genre: item.genre,
          title: item.title,
          artwork: item.artwork,
          date: item.date,
          postRange: item.postRange,
          materialRange: item.materialRange,
          artist: firestore().collection('users').doc(item.artist.id),
          tags: item.tags,
        });
        SoundPlayer.playSoundFile('like', 'mp3');
        break;
      case null:
        dislikeRef.delete();
        likeRef.delete();
        break;
    }
  }, [likes]);
  useEffect(() => {
    TrackPlayer.addEventListener('remote-next', () => {
      dispatch({type: 'SETLIKE', likes: true});
    });
    TrackPlayer.addEventListener('remote-previous', () => {
      dispatch({type: 'SETLIKE', likes: false});
    });
    const likeRef = firestore()
      .collection(`users/${auth().currentUser.uid}/likes`)
      .doc(item && item.id);
    const dislikeRef = firestore()
      .collection(`users/${auth().currentUser.uid}/dislikes`)
      .doc(item && item.id);
    likeRef.get().then(like => {
      dislikeRef.get().then(dislike => {
        if (like._exists || dislike._exists) {
          if (like._exists) {
            dispatch({type: 'SETLIKE', likes: true});
          } else {
            dispatch({type: 'SETLIKE', likes: false});
          }
        } else {
          dispatch({type: 'SETLIKE', likes: null});
        }
      });
    });
  }, [item]);

  useTrackPlayerEvents(events, event => {
    if (event.type === TrackPlayerEvents.PLAYBACK_ERROR) {
      console.warn('An error occured while playing the current track.');
    }
    if (event.type === TrackPlayerEvents.PLAYBACK_STATE) {
      setPlayerState(event.state);
    }
  });

  const playing = playerState === STATE_PLAYING;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.cancel}
        onPress={() => {
          dispatch({type: 'PLAYERTOGGLEOPEN'});
        }}>
        <Icon name="chevron-down" size={40} color="black" />
      </TouchableOpacity>
      <View style={styles.hero}>
        <Image source={{uri: item && item.artwork}} style={styles.heroImage} />
      </View>
      <View style={styles.profile}>
        <View style={styles.profileTitle}>
          {item && item.artist && (
            <Image
              source={{uri: item.artist.profileImage}}
              style={styles.profileImage}
            />
          )}
          <Text style={styles.profileText}>
            {item && item.artist && item.artist.name}
          </Text>
        </View>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>フォロー</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>{item && item.title}</Text>
      <View style={styles.controller}>
        <TouchableOpacity style={styles.controllerButton}>
          <Icon name="shuffle-variant" size={32} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controllerButton}>
          <Icon name="skip-previous" size={48} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.play}
          onPress={async () => {
            if (playing) {
              await TrackPlayer.pause();
            } else {
              await TrackPlayer.play();
            }
          }}>
          {!playing && <Icon name="play" size={48} color="white" />}
          {playing && <Icon name="pause" size={48} color="white" />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.controllerButton}>
          <Icon name="skip-next" size={48} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>1.0x</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.controller}>
        <TouchableOpacity style={styles.controllerButton}>
          <Icon name="message-outline" size={32} color="#A7A7A7" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controllerButton}>
          <Icon name="share-variant" size={32} color="#A7A7A7" />
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
        <TouchableOpacity style={styles.controllerButton}>
          <Icon name="playlist-plus" size={32} color="#A7A7A7" />
        </TouchableOpacity>
      </View>
      <View>
        <Text style={styles.description}>{item && item.genre} </Text>
        <TouchableOpacity style={styles.action}>
          <Text style={styles.actionText}>もっと見る</Text>
        </TouchableOpacity>
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
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  cancel: {
    position: 'absolute',
    zIndex: 8,
    left: 8,
    top: 8,
  },
  hero: {
    marginVertical: 24,
    width: 304,
    height: 304,
    borderRadius: 152,
    alignSelf: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroImage: {
    width: 304,
    height: 304,
    borderRadius: 152,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  profile: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileText: {
    height: 24,
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileImage: {
    marginRight: 8,
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  button: {
    borderWidth: 1,
    borderRadius: 24,
    borderColor: '#F2994A',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 13,
    height: 16,
    color: '#F2994A',
  },
  title: {
    height: 24,
    fontSize: 20,
    marginTop: 8,
    marginBottom: 32,
  },
  controller: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 32,
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
  },
  action: {
    alignSelf: 'flex-end',
  },
});
