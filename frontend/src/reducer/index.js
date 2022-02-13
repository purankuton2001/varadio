import TrackPlayer from 'react-native-track-player';
import analytics from '@react-native-firebase/analytics';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const itemsUpdate = (items, index) => {
  TrackPlayer.reset().then(() => {
    const item = items.slice(index);
    TrackPlayer.add(item).then(() => {
      TrackPlayer.play();
    });
  });
  return {
    index,
    items,
    playerIsVisible: true,
    first: true,
  };
};
let interval = false;
export const playerReducer = (oldState, action) => {
  console.log(oldState);
  console.log(action);
  switch (action.type) {
    case 'ITEMSUPDATE':
      return {...oldState, items: action.data};
    case 'RECOMMENDS':
      const r = itemsUpdate(action.items, 0);
      return r;
    case 'CONTENTSSELECT':
      analytics().logSelectContent({
        content_type: 'post',
        item_id: action.items[action.index].id,
      });
      const k = itemsUpdate(action.items, action.index);
      return k;
    case 'TRACKCHANGE':
      if (interval) {
        console.log("interval");
        return oldState;
      } else {
        const item = oldState.first
        ? oldState.items[oldState.index]
        : oldState.items[oldState.index + 1];
        interval = true;
        if (item) {
          setTimeout(() => {
            interval = false;
          }, 500);
          const i = {
            item_id: item.id,
          };
          analytics().logViewItem({items: [i]});
          if(auth().currentUser){
            firestore()
            .doc(`users/${auth().currentUser.uid}/viewed/${item.id}`)
            .set({
              duration: item.duration,
              records: item.records,
              isComment: item.isComment,
              url: item.url,
              genre: item.genre,
              title: item.title,
              artwork: item.artwork,
              date: item.date,
              updatedAt: new Date(),
              postRange: item.postRange,
              artist: firestore().collection('users').doc(item.artist.id),
              tags: item.tags,
            });
          }
          if (oldState.first) {
            oldState.first = false;
            return oldState;
          } else {
            return {...oldState, index: oldState.index + 1};
          }
        }
        else{
          return oldState
        }
      }
    case 'PLAYERTOGGLEOPEN':
      return {...oldState, playerIsVisible: !oldState.playerIsVisible};
    case 'SETLIKE':
      function likesTostring(likes) {
        switch (likes) {
          case true:
            return 'true';
          case false:
            return 'false';
          case null:
            return 'null';
        }
      }
      if (oldState.items[oldState.index]) {
        const item = {
          item_id: oldState.items[oldState.index].id,
          item_brand: likesTostring(action.likes),
        };
        analytics().logAddToWishlist({items: [item]});
      }
      return {...oldState, likes: action.likes};
    case 'CHANGELIKE':
      return {...oldState, likes: action.likes};
  }
};
export const editorReducer = (oldState, action) => {
  console.log(oldState);
  console.log(action);
  switch (action.type) {
    case 'RANGECHANGE':
      return {...oldState, displayRange: action.displayRange};
    case 'TOGGLEPLAY':
      return {...oldState, playing: !oldState.playing};
    case 'PAUSE':
      return {...oldState, playing: false};
    case 'RECORDSADD':
      return {
        ...oldState,
        duration:
          action.records.end > oldState.duration
            ? action.records.end
            : oldState.duration,
        records: [...oldState.records, action.records],
      };
    case 'URLPOST':
      oldState.records[action.id].url = action.url;
      return {
        oldState,
      };
    case 'SEEK':
      return {...oldState, currentTime: action.value};
    case 'SEEKSTART':
      return {...oldState, start: action.value};
    case 'SEEKEND':
      return {...oldState, end: action.value};
    case 'TIMEPASS':
      return {...oldState, currentTime: oldState.currentTime + 0.1};
    case 'SEEKRECORDS':
      oldState.records[action.id].start = action.value;
      oldState.records[action.id].end =
        action.value +
        oldState.records[action.id].trimEnd -
        oldState.records[action.id].trimStart;
      return oldState;
    case 'RECORDSEDIT':
      return {
        ...oldState,
        records: oldState.records.splice(action.index, 1, action.records),
      };
  }
};
