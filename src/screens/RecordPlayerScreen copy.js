import React, {useEffect, useState} from 'react';
import {StyleSheet, TouchableOpacity, View, Text, Image} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MusicControl, {Command} from 'react-native-music-control';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import SoundPlayer from 'react-native-sound-player';
import MainRecord from 'react-native-sound-player';

export default function RecordPlayerScreen(props) {
  const {navigation, route} = props;
  const [likes, setLikes] = useState();
  const {item} = route.params;
  const [playing, setPlaying] = useState(true);

  const likeRef = firestore()
    .collection(`users/${auth().currentUser.uid}/likes`)
    .doc(item.id);
  const dislikeRef = firestore()
    .collection(`users/${auth().currentUser.uid}/dislikes`)
    .doc(item.id);
  const likePress = () => {
    if (!likes) {
      if (likes === false) {
        dislikeRef.delete();
      }
      likeRef
        .set({
          isComment: item.isComment,
          url: item.url,
          genre: item.genre,
          title: item.title,
          artwork: item.artwork,
          date: item.date,
          postRange: item.postRange,
          materialRange: item.materialRange,
          artist: item.artist,
        })
        .then(async () => {
          SoundPlayer.playSoundFile('like', 'mp3');
          setLikes(true);
        });
    } else {
      likeRef.delete().then(() => {
        setLikes(null);
      });
    }
  };
  const disLikePress = () => {
    if (likes !== false) {
      if (likes) {
        likeRef.delete();
      }
      dislikeRef
        .set({
          isComment: item.isComment,
          url: item.url,
          genre: item.genre,
          title: item.title,
          artwork: item.artwork,
          date: item.date,
          postRange: item.postRange,
          materialRange: item.materialRange,
          artist: item.artist,
          tags: item.tags,
        })
        .then(() => {
          SoundPlayer.playSoundFile('dislike', 'mp3');
          setLikes(false);
        });
    } else {
      dislikeRef.delete().then(async () => {
        setLikes(null);
      });
    }
  };
  useEffect(() => {
    const options = {
      rating: MusicControl.RATING_THUMBS_UP_DOWN,
    };
    MusicControl.enableControl('setRating', true);
    MusicControl.enableControl('play', true);
    MusicControl.enableControl('pause', true);
    MusicControl.enableControl('nextTrack', false);
    MusicControl.enableControl('previousTrack', false);
    let unsubscribe = () => {};
    firestore()
      .collection(`users/${auth().currentUser.uid}/likes`)
      .doc(item.id)
      .get()
      .then(like => {
        firestore()
          .collection(`users/${auth().currentUser.uid}/dislikes`)
          .doc(item.id)
          .get()
          .then(dislikes => {
            if (like._exists || dislikes._exists) {
              if (like._exists) {
                setLikes(true);
              } else {
                setLikes(false);
              }
            } else {
              setLikes(null);
            }
          });
      });
    MusicControl.updatePlayback(options);
    MainRecord.playUrl(item.url);
    setTimeout(() => {
      MusicControl.setNowPlaying({
        title: item.title,
        artwork: item.artwork,
        artist: item.artist.name,
        rating: 3,
      }).then(() => {
        MusicControl.on(Command.pause, () => {
          MainRecord.pause();
          MusicControl.updatePlayback({
            state: MusicControl.STATE_PAUSED,
            elapsedTime: 135,
          });
          setPlaying(false);
        });
        MusicControl.on(Command.play, () => {
          MainRecord.play();
          MusicControl.updatePlayback({
            state: MusicControl.STATE_PLAYING,
            elapsedTime: 135,
          });
          setPlaying(true);
        });
        MusicControl.on(Command.setRating, rating => {
          switch (rating) {
            case rating === false:
              likePress();
              MusicControl.updatePlayback({
                rating,
                elapsedTime: 135,
              });
              break;
            case rating === true:
              disLikePress();
              MusicControl.updatePlayback({
                rating,
                elapsedTime: 135,
              });
              break;
            case rating === null:
              setLikes(null);
              MusicControl.updatePlayback({
                rating,
                elapsedTime: 135,
              });
              break;
          }
        });
      });
    }, 500);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.cancel}
        onPress={() => {
          navigation.goBack();
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
          <Text style={styles.profileText}>{item && item.artist.name}</Text>
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
              setPlaying(false);
              MainRecord.pause();
              MusicControl.updatePlayback({
                state: MusicControl.STATE_PAUSED,
                elapsedTime: 135,
              });
            } else {
              setPlaying(true);
              MainRecord.play();
              MusicControl.updatePlayback({
                state: MusicControl.STATE_PLAYING,
                elapsedTime: 135,
              });
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
        <TouchableOpacity style={styles.controllerButton} onPress={likePress}>
          <Icon
            name="thumb-up"
            size={32}
            color={!likes ? '#A7A7A7' : '#F2994A'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controllerButton}
          onPress={disLikePress}>
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
    marginVertical: 32,
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
