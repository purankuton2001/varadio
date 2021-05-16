import React, {createContext, useReducer, useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import SoundPlayer from 'react-native-sound-player';
import TrackPlayer from 'react-native-track-player';

const InitialPlayerState = {
  likes: null,
  items: [],
  item: {},
  index: 0,
};
export const PlayerContext = createContext(InitialPlayerState);
const itemsUpdate = (items, index) => {
  items.forEach(i => {
    TrackPlayer.add({
      id: i.id,
      title: i.title,
      url: i.url,
      genre: i.genre,
      artwork: i.artwork,
      date: i.date,
      artist: i.artist.name,
    });
  });
  return {index, items, item: items[index]};
};
const itemUpdate = (items, index) => {
  const item = items[index];
  let object = {
    item,
    items,
    index,
  };
  const likeRef = firestore()
    .collection(`users/${auth().currentUser.uid}/likes`)
    .doc(item && item.id);
  const dislikeRef = firestore()
    .collection(`users/${auth().currentUser.uid}/dislikes`)
    .doc(item && item.id);

  likeRef.get().then(like => {
    dislikeRef.get().then(dislikes => {
      if (like._exists || dislikes._exists) {
        if (like._exists) {
          object = {
            ...object,
            likes: true,
          };
        } else {
          object = {
            ...object,
            likes: false,
          };
        }
      } else {
        object = {
          ...object,
          likes: null,
        };
      }
    });
  });
  return object;
};

const likePress = state => {
  const {item} = state;
  const likeRef = firestore()
    .collection(`users/${auth().currentUser.uid}/likes`)
    .doc(item && item.id);
  const dislikeRef = firestore()
    .collection(`users/${auth().currentUser.uid}/dislikes`)
    .doc(item && item.id);
  if (!state.likes) {
    if (state.likes === false) {
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
      .then(() => {
        SoundPlayer.playSoundFile('like', 'mp3');
        return {
          ...state,
          likes: true,
        };
      });
  } else {
    likeRef.delete().then(() => {
      return {
        ...state,
        likes: null,
      };
    });
  }
};

const disLikePress = state => {
  const {item} = state;
  const likeRef = firestore()
    .collection(`users/${auth().currentUser.uid}/likes`)
    .doc(item.id);
  const dislikeRef = firestore()
    .collection(`users/${auth().currentUser.uid}/dislikes`)
    .doc(item.id);

  if (state.likes !== false) {
    if (state.likes) {
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
      })
      .then(() => {
        SoundPlayer.playSoundFile('dislike', 'mp3');
        return {
          ...state,
          likes: false,
        };
      });
  } else {
    dislikeRef.delete().then(() => {
      return {
        ...state,
        likes: null,
      };
    });
  }
};

export function playerReducer(oldState, action) {
  switch (action.type) {
    case 'LIKEPRESS':
      const m = likePress(oldState);
      return m;
    case 'DISLIKEPRESS':
      return disLikePress(oldState);
    case 'CONTENTSSELECT':
      console.log(oldState);
      const k = itemsUpdate(action.items, action.index);
      return k;
    case 'TRACKCHANGE':
      if (oldState) {
        const l = itemUpdate(
          oldState.items,
          oldState.index - oldState.items.length + 1,
        );
        return l;
      }
      return oldState;
  }
}

export const PlayerContextProvider = ({child}) => {
  useEffect(() => {
    const recordOptions = {
      ratingType: TrackPlayer.RATING_THUMBS_UP_DOWN,
      stopWithApp: true,
      previousIcon: require('../Icon/dislike_on.png'),
      nextIcon: require('../Icon/dislike_on.png'),
      capabilities: [
        TrackPlayer.CAPABILITY_PLAY,
        TrackPlayer.CAPABILITY_PAUSE,
        TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
        TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
      ],
      notificationCapabilities: [
        TrackPlayer.CAPABILITY_PLAY,
        TrackPlayer.CAPABILITY_PAUSE,
        TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
        TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
      ],
      compactCapabilities: [
        TrackPlayer.CAPABILITY_PLAY,
        TrackPlayer.CAPABILITY_PAUSE,
      ],
    };
    TrackPlayer.setupPlayer().then(() => {
      TrackPlayer.updateOptions(recordOptions);
      TrackPlayer.addEventListener('playback-track-changed', () => {
        dispatch({type: 'TRACKCHANGE'});
      });
      TrackPlayer.addEventListener('remote-play', () => {
        TrackPlayer.play();
      });
      TrackPlayer.addEventListener('remote-next', () => {
        likePress();
      });
      TrackPlayer.addEventListener('remote-previous', () => {
        disLikePress();
      });
      TrackPlayer.addEventListener('remote-pause', () => {
        TrackPlayer.pause();
      });
    });
  }, []);
  const [state, dispatch] = useReducer(playerReducer, InitialPlayerState);
  return (
    <PlayerContext.Provider value={{state, dispatch}}>
      {child}
    </PlayerContext.Provider>
  );
};
