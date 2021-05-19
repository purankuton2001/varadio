/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useContext} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import HomeStackScreen from './HomeStackScreen';
import ReserchStackScreen from './ReserchStackScreen';
import NotificationStackScreen from './NotificationStackScreen';
import ProfileStackScreen from './ProfileStackScreen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Text,
  Platform,
} from 'react-native';
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
import DocumentPicker from 'react-native-document-picker';

const events = [
  TrackPlayerEvents.PLAYBACK_STATE,
  TrackPlayerEvents.PLAYBACK_ERROR,
];

const Tab = createBottomTabNavigator();

export default function MainTabScreen(props) {
  const {state, dispatch} = useContext(PlayerContext);
  const {index, items, playerIsVisible, likes} = state;
  const item = items[index - 3];
  let options = {
    type: [
      DocumentPicker.types.audio,
      Platform.OS === 'ios' ? 'com.apple.quicktime-movie' : 'video/mp4',
    ],
  };
  const {navigation} = props;
  const [isVisible, setIsVisible] = useState(false);
  const [playerState, setPlayerState] = useState(null);

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
          <TouchableOpacity
            style={styles.miniPlayer}
            onPress={() => {
              dispatch({type: 'PLAYERTOGGLEOPEN'});
            }}>
            <View style={styles.left}>
              <Image
                source={{uri: item && item.artwork}}
                style={styles.image}
              />
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
              <TouchableOpacity
                style={styles.play}
                onPress={async () => {
                  if (playing) {
                    await TrackPlayer.pause();
                  } else {
                    await TrackPlayer.play();
                  }
                }}>
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
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={() => {
              setIsVisible(true);
            }}>
            <PostButton size={50} />
          </TouchableOpacity>
        </View>
      )}
      <BottomSheet
        isVisible={isVisible}
        // eslint-disable-next-line react-native/no-inline-styles
        containerStyle={{
          backgroundColor: 'rgba(0.5, 0.25, 0, 0.2)',
        }}>
        <TouchableOpacity
          style={styles.bottomBotton}
          onPress={() => {
            setIsVisible(false);
            navigation.navigate('RecordCreate');
          }}>
          <Text style={styles.bottomText}>録音する</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomBotton}
          onPress={async () => {
            setIsVisible(false);
            const response = await DocumentPicker.pick(options);
            try {
              console.log('Response = ', response);
              const extension = await response.uri.match(/[^.]+$/);
              console.log(extension);
              const isVideo = response.type.indexOf('audio') === -1;
              navigation.navigate('Trimming', {
                filename: response.uri,
                isVideo,
                extension,
              });
            } catch (error) {
              if (!DocumentPicker.isCancel(error)) {
                throw error;
              }
            }
          }}>
          <Text style={styles.bottomText}>ファイルを選択</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomBotton}
          onPress={() => {
            setIsVisible(false);
          }}>
          <Text style={styles.bottomText}>キャンセル</Text>
        </TouchableOpacity>
      </BottomSheet>
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
  title: {
    fontSize: 16,
    height: 24,
    fontWeight: 'bold',
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
  play: {marginHorizontal: 8},
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
