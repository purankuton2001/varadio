/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, {useState, useContext, useEffect} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  Dimensions,
  FlatList,
  Linking,
  Alert,
} from 'react-native';
import {PlayerContext} from '../../App';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TrackPlayer, {
  useTrackPlayerProgress,
  TrackPlayerEvents,
  useTrackPlayerEvents,
  STATE_PLAYING,
} from 'react-native-track-player';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import analytics from '@react-native-firebase/analytics';
import SoundPlayer from 'react-native-sound-player';
import PlayerBottom from '../components/PlayerBottom';
import MiniPlayer from '../components/MiniPlayer';
import CheckBox from '@react-native-community/checkbox';
import AddPlayList from '../components/AddPlayList';
import {useNavigation} from '@react-navigation/native';

const events = [
  TrackPlayerEvents.PLAYBACK_STATE,
  TrackPlayerEvents.PLAYBACK_ERROR,
];

export default function RecordPlayerScreen(props) {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(false);
  const {height} = Dimensions.get('window');
  const [playerState, setPlayerState] = useState(null);
  const {state, dispatch} = useContext(PlayerContext);
  const {index, items, likes, pressNotification} = state;
  const item = items[index];
  const [likeAmount, setLikeAmount] = useState(0);
  const [disLikeAmount, setDisLikeAmount] = useState(0);
  const [visible, setVisible] = useState(false);
  const [follow, setFollow] = useState(null);
  const [playLists, setPlayLists] = useState();
  const [checked, setChecked] = useState([]);
  const [follower, setFollower] = useState(false);

  useEffect(() => {if(pressNotification)setTab('comments');}, [pressNotification]);

  const changeVisible = st => {
    setVisible(st);
  };

  const check = id => {
    if (!isCheck(id)) {
      setChecked([...checked, id]);
    } else {
      setChecked([checked.filter(i => i !== id)]);
    }
  };
  const isCheck = id => {
    const isThere = checked.includes(id);
    return isThere;
  };
  const openUrl = url => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert(
          'エラー',
          'このページを開ませんでした',
          [{text: 'OK', onPress: () => console.log('OK Pressed')}],
          {cancelable: false},
        );
      }
    });
  };
  const followPress = () => {
    setFollow(!follow);
  };

  useEffect(() => {
    if (auth().currentUser) {
      const likesRef = firestore()
        .collection(`posts/${item.id}/likes`)
      likesRef.get().then(likes => {
        setLikeAmount(likes.size);
      });
    }
  }, [item]);
  useEffect(() => {
    if (auth().currentUser) {
      const dislikesRef = firestore()
        .collection(`posts/${item.id}/dislikes`)
      dislikesRef.get().then(dislikes => {
        setDisLikeAmount(dislikes.size);
      });
    }
  }, [item]);
  useEffect(() => {
    if (auth().currentUser) {
      const followerRef = firestore()
        .collection(`users/${auth().currentUser.uid}/followers`)
        .doc(item.artist.id);
      followerRef.get().then(followers => {
        followers._exists ? setFollower(true) : setFollower(false);
      });
    }
  }, [item]);

  useEffect(() => {
    if (auth().currentUser) {
      const followRef = firestore()
        .collection(`users/${auth().currentUser.uid}/follows`)
        .doc(item?.artist.id);
      followRef.get().then(follow_user => {
        console.log(follow_user);
        follow_user._exists ? setFollow(true) : setFollow(false);
      });
    }
  }, [item]);

  useEffect(() => {
    if (auth().currentUser && follow !== null) {
      const followRef = firestore()
        .collection(`users/${auth().currentUser.uid}/follows`)
        .doc(item?.artist?.id);
      follow ? followRef.set(item.artist) : followRef.delete();
    }
  }, [follow]);

  function followText() {
    if (follow && follower) {
      return '相互フォロー';
    } else {
      if (follow) {
        return 'フォロー中';
      } else {
        if (follower) {
          return 'フォロー返し';
        } else {
          return 'フォロー';
        }
      }
    }
  }

  useEffect(() => {
    let unsubscribe = () => {};
    if (auth().currentUser) {
      const db = firestore();
      const ref = db
        .collection(`users/${auth().currentUser.uid}/playLists`)
        .orderBy('date', 'desc');
      unsubscribe = ref.onSnapshot(
        snapshot => {
          const userPlayLists = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            data.artist.get().then(artist => {
              userPlayLists.push({
                id: doc.id,
                title: data.title,
                artwork: data.artwork,
                artist: artist.data(),
                description: data.description,
                date: data.date.toDate(),
                link: data.link,
                posts: data.posts,
              });
            });
          });
          setPlayLists(userPlayLists);
          setLoading(false);
        },
        () => {
          setLoading(false);
          Alert.alert('データの読み込みに失敗しました。');
        },
      );
    }
    return unsubscribe;
  }, []);

  const changeTab = value => {
    setTab(value);
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
  const {position} = useTrackPlayerProgress(500);
  function renderItem({item}) {
    return (
      position > item.start &&
      position < item.end && (
        <TouchableOpacity
          onPress={() => {
            firestore()
              .doc(`users/${item.artist}`)
              .get()
              .then(a => {
                const artist = a.data();
                navigation.navigate('Record', {
                  item: {
                    ...item,
                    id: item.recordId,
                    artist,
                  },
                });
                dispatch({type: 'PLAYERTOGGLEOPEN'});
              });
          }}
          style={styles.recordsItem}>
          <Image source={{uri: item.artwork}} style={styles.recordsArtwork} />
          <Text style={styles.recordsTitle}>{item.title}</Text>
        </TouchableOpacity>
      )
    );
  }
  function renderTag({item}) {
    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('Tag', {item});
          dispatch({type: 'PLAYERTOGGLEOPEN'});
        }}>
        <Text style={styles.tagTitle}>{item}</Text>
      </TouchableOpacity>
    );
  }

  const togglePlay = async () => {
    if (playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const press = () => {
    setTab(false);
  };

  return (
    <View style={[styles.container, {height}]}>
      {tab && (
        <MiniPlayer
          playing={playing}
          togglePlay={togglePlay}
          press={press}
          style={{top: 0}}
        />
      )}
      <TouchableOpacity
        style={styles.cancel}
        onPress={() => {
          dispatch({type: 'PLAYERTOGGLEOPEN'});
        }}>
        <Icon name="chevron-down" size={40} color="black" />
      </TouchableOpacity>
      <View style={styles.hero}>
        {item && (
          <Image source={{uri: item.artwork}} style={styles.heroImage} />
        )}
      </View>
      <View style={styles.recordsContainer}>
        <Icon name="music" size={32} color="#F2994A" />
        {item && (
          <FlatList
            horizontal
            scrollEnabled={false}
            nestedScrollEnabled={true}
            data={item.records}
            renderItem={renderItem}
            keyExtractor={item => toString(item.id)}
          />
        )}
      </View>
      <View style={styles.tags}>
        {item && (
          <FlatList
            horizontal
            scrollEnabled={false}
            nestedScrollEnabled={true}
            data={item.tags}
            renderItem={renderTag}
            keyExtractor={item => item.id}
          />
        )}
      </View>
      <TouchableOpacity
        style={styles.profile}
        onPress={() => {
          navigation.navigate('profile', {id: item.artist.id});
          dispatch({type: 'PLAYERTOGGLEOPEN'});
        }}>
        <View style={styles.profileTitle}>
          {item?.artist && (
            <Image
              source={{uri: item.artist.profileImage}}
              style={styles.profileImage}
            />
          )}
          <Text style={styles.profileText}>
            {item?.artist && item.artist.name}
          </Text>
        </View>
        {auth().currentUser.uid !== item.artist.id && (
          <TouchableOpacity
            style={[
              styles.button,
              {backgroundColor: follow ? 'white' : '#F2994A'},
            ]}
            onPress={followPress}>
            <Text
              style={[styles.buttonText, {color: follow ? 'black' : 'white'}]}>
              {followText()}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.feedbackButton}
          onPress={() => {
            if (likes !== false) {
              dispatch({type: 'SETLIKE', likes: false});
            } else {
              dispatch({type: 'SETLIKE', likes: null});
            }
          }}>
          <Text style={[styles.amount, {color: likes === false ? '#F2994A' : '#A7A7A7'}]}>{disLikeAmount || 0}</Text>
          <Icon
            name="thumb-down"
            size={32}
            color={likes === false ? '#F2994A' : '#A7A7A7'}
          />
        </TouchableOpacity>
        <Text style={styles.title}>{item?.title}</Text>
        <TouchableOpacity
          style={styles.feedbackButton}
          onPress={() => {
            !likes
              ? dispatch({type: 'SETLIKE', likes: true})
              : dispatch({type: 'SETLIKE', likes: null});
          }}>
          <Text style={[styles.amount, {color: likes ? '#F2994A' : '#A7A7A7'}]}>{likeAmount || 0}</Text>
          <Icon
            name="thumb-up"
            size={32}
            color={!likes ? '#A7A7A7' : '#F2994A'}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.controller}>
        <TouchableOpacity>
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
        <TouchableOpacity>
          <Icon name="skip-next" size={48} color="black" />
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>1.0x</Text>
        </TouchableOpacity> */}
      </View>
      <View style={styles.controller}>
        <TouchableOpacity
          style={[styles.controllerButton, {backgroundColor: '#DBDBDB'}]}
          onPress={() => {
            openUrl(item.link);
          }}>
          <Text style={[styles.controllerText, {color: 'black'}]}>移動</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controllerButton}
          onPress={() => {
            auth().currentUser ? setVisible(true) : null;
          }}>
          <Text style={styles.controllerText}>保存</Text>
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles.playerBottom,
          {
            transform: [{translateY: tab !== false ? 120 - height : 0}],
          },
        ]}>
        <PlayerBottom tab={tab} likesAmount={likeAmount} dislikesAmount={disLikeAmount} changeTab={changeTab} />
      </View>
      {/* <View>
        <Text style={styles.description}>{item && item.genre} </Text>
        <TouchableOpacity style={styles.action}>
          <Text style={styles.actionText}>もっと見る</Text>
        </TouchableOpacity>
      </View> */}
      <AddPlayList
        changeVisible={changeVisible}
        visible={visible}
        item={item}
      />
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
    position: 'relative',
  },
  miniPlayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 8,
  },
  playerBottom: {
    position: 'absolute',
    top: '100%',
    right: 0,
    left: 0,
  },
  cancel: {
    position: 'absolute',
    zIndex: 8,
    left: 8,
    top: 8,
  },
  hero: {
    marginVertical: 16,
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
    borderRadius: 24,
  },
  button: {
    borderColor: '#F2994A',
    borderWidth: 1,
    borderRadius: 24,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 13,
    height: 16,
    color: 'white',
  },
  title: {
    alignSelf: 'center',
    height: 32,
    fontSize: 26,
    marginTop: 8,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  controller: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 32,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  controllerButton: {
    borderRadius: 16,
    backgroundColor: '#F2994A',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  amount: {
    marginBottom: 2,
    fontSize: 15,
  },
  controllerText: {
    fontSize: 18,
    height: 24,
    color: 'white',
  },
  feedbackButton: {
    alignItems:'center',
    marginBottom: 24,
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
  tagTitle: {
    color: '#F2994A',
    marginVertical: 4,
  },
  recordsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    marginBottom: 8,
  },
  recordsItem: {
    flexDirection: 'row',
    marginLeft: 16,
    alignItems: 'center',
  },
  recordsArtwork: {
    height: 32,
    width: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  recordsTitle: {
    fontSize: 12,
    height: 16,
  },
});
