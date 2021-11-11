/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useContext} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import HomeStackScreen from './HomeStackScreen';
import ReserchStackScreen from './ReserchStackScreen';
import NotificationStackScreen from './NotificationStackScreen';
import ProfileStackScreen from './ProfileStackScreen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {View, StyleSheet, TouchableOpacity, Keyboard, Text} from 'react-native';
import PostButton from '../Icon/PostButton';
import {BottomSheet, Image} from 'react-native-elements';
import {PlayerContext} from '../../App';
import TrackPlayer, {
  TrackPlayerEvents,
  useTrackPlayerEvents,
  STATE_PLAYING,
} from 'react-native-track-player';
import RecordPlayerScreen from './RecordPlayerScreen';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import SoundPlayer from 'react-native-sound-player';
import MiniPlayer from '../components/MiniPlayer';

const events = [
  TrackPlayerEvents.PLAYBACK_STATE,
  TrackPlayerEvents.PLAYBACK_ERROR,
];

const Tab = createBottomTabNavigator();

export default function MainTabScreen(props) {
  const {state, dispatch} = useContext(PlayerContext);
  const {index, items, playerIsVisible, likes} = state;
  const item = items[index - 3];
  const {navigation} = props;
  const [playerState, setPlayerState] = useState(null);

  const togglePlay = async () => {
    if (playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const press = () => {
    dispatch({type: 'PLAYERTOGGLEOPEN'});
  };

  useTrackPlayerEvents(events, event => {
    if (event.type === TrackPlayerEvents.PLAYBACK_ERROR) {
      console.warn('An error occured while playing the current track.');
    }
    if (event.type === TrackPlayerEvents.PLAYBACK_STATE) {
      setPlayerState(event.state);
    }
  });

  const playing = playerState === STATE_PLAYING;

  useEffect(() => {
    if (auth().currentUser) {
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
    }
  }, [likes]);
  useEffect(() => {
    if (auth().currentUser) {
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
          if (like._exists) {
            dispatch({type: 'SETLIKE', likes: true});
          } else {
            if (dislike._exists) {
              dispatch({type: 'SETLIKE', likes: false});
            } else {
              dispatch({type: 'SETLIKE', likes: null});
            }
          }
        });
      });
    }
  }, [item]);

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
    Keyboard.addListener('keyboardDidHide', _keyboardDidHide);

    // cleanup function
    return () => {
      Keyboard.removeListener('keyboardDidShow', _keyboardDidShow);
      Keyboard.removeListener('keyboardDidHide', _keyboardDidHide);
    };
  }, []);

  const [keyboardStatus, setKeyboardStatus] = useState(undefined);
  const _keyboardDidShow = () => setKeyboardStatus(true);
  const _keyboardDidHide = () => setKeyboardStatus(false);

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={({route}) => ({
          tabBarIcon: ({focused, color, size}) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = 'home-variant';
            } else if (route.name === 'Reserch') {
              iconName = 'magnify';
            } else if (route.name === 'Notification') {
              iconName = 'bell-ring';
            } else if (route.name === 'Profile') {
              iconName = 'account';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
        })}
        tabBarOptions={{
          activeTintColor: '#F2994A',
          inactiveTintColor: '#A7A7A7',
          keyboardHidesTabBar: 'true',
        }}>
        <Tab.Screen name="Home" component={HomeStackScreen} />
        <Tab.Screen name="Reserch" component={ReserchStackScreen} />
        <Tab.Screen name="Notification" component={NotificationStackScreen} />
        <Tab.Screen name="Profile" component={ProfileStackScreen} />
      </Tab.Navigator>
      {!keyboardStatus && (
        <View>
          <MiniPlayer
            playing={playing}
            togglePlay={togglePlay}
            press={press}
            style={{bottom: 48}}
          />
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={() => {
              navigation.navigate('RecordEdit');
            }}>
            <PostButton size={50} />
          </TouchableOpacity>
        </View>
      )}
      <BottomSheet isVisible={playerIsVisible}>
        <RecordPlayerScreen />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
    backgroundColor: 'white',
  },
  buttonContainer: {
    backgroundColor: '#F2994A',
    width: 64,
    height: 64,
    borderRadius: 40,
    alignSelf: 'center',
    zIndex: 8,
    position: 'absolute',
    bottom: 8,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 4,
    paddingBottom: 4,
  },
  bottomBotton: {
    backgroundColor: 'white',
    justifyContent: 'center',
    height: 48,
    paddingHorizontal: 12,
  },
  bottomText: {
    height: 24,
    fontSize: 18,
    justifyContent: 'center',
  },
  miniPlayer: {
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: 'black',
    shadowOffset: {height: 1},
    shadowOpacity: 0.3,
    width: '100%',
    flexDirection: 'row',
    position: 'absolute',
    bottom: 48,
    zIndex: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  image: {
    width: 72,
    height: 72,
    marginRight: 8,
  },
  cancel: {
    position: 'absolute',
    zIndex: 8,
    right: 40,
    top: 40,
  },
  sheetContaner: {
    position: 'relative',
  },
  playerCancel: {
    position: 'absolute',
    zIndex: 8,
    left: 8,
    top: 8,
  },
  hero: {
    width: 304,
    height: 304,
    marginVertical: 32,
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
  playerTitle: {
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
  playerPlay: {
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
  playerContainer: {
    flex: 1,
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: 'black',
    shadowOffset: {height: 1},
    shadowOpacity: 0.3,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
});
