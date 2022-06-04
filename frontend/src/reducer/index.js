import TrackPlayer from 'react-native-track-player';
import analytics from '@react-native-firebase/analytics';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import SoundPlayer from 'react-native-sound-player';

const InitialEditorState = {
  start: 0,
  end: 10,
  currentTime: 0,
  records: [],
  duration: 10,
};

const itemsUpdate = (items, index) => {
  TrackPlayer.reset().then(() => {
    const item = items.slice(index);
    const tracks = [];
    item.forEach(data => {
      tracks.push({
        duration: data.duration,
        id: data.id,
        title: data.title,
        artwork: data.artwork,
        date: data.date,
        genre: data.genre,
        url: data.url,
        playLists: data.playLists,
        artist: data.artist.name,
      });
    });
    TrackPlayer.add(tracks).then(() => {
      TrackPlayer.play();
    });
  });
  first = true;
  return {
    index,
    items,
    playerIsVisible: true,
  };
};
let first = false;
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
    case 'PRESSNOTIFICATIONFOLLOW':
      return {...oldState, pressNotificationFollow: action.pressNotification};
    case 'PRESSNOTIFICATIONSELL':
      return {...oldState, pressNotificationSell: action.pressNotification};
    case 'PRESSNOTIFICATIONCOMMENT':
      analytics().logSelectContent({
        content_type: 'post',
        item_id: action.items[action.index].id,
      });
      const s = itemsUpdate(action.items, action.index);
      return {...s, pressNotification: action.pressNotification};
    case 'FINISHNOTIFICATIONFOLLOW':
      return {...oldState, pressNotificationFollow: null};
    case 'FINISHNOTIFICATIONSELL':
      return {...oldState, pressNotificationSell: null};
    case 'CONTENTSSELECT':
      analytics().logSelectContent({
        content_type: 'post',
        item_id: action.items[action.index].id,
      });
      const t = itemsUpdate(action.items, action.index);
      return t;
    case 'TRACKCHANGE':
      if (interval) {
        console.log(interval);
        return oldState;
      } else {
        const item = oldState.first
          ? oldState.items[oldState.index]
          : oldState.items[oldState.index + 1];
        if (item) {
          interval = true;
          console.log("start interval")
          setTimeout(() => {
            interval = false;
          }, 500);
          let records_id = [];
          item.records.forEach(record => {records_id.push(record.recordId)});
          analytics().logEvent('view_post', {
            item_id: item.id,
            tags: item.tags.join(','),
            records: records_id.join(','),
            playlists: item.playLists.join(',')
          });
          if (auth().currentUser) {
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
          if (first) {
            first = false;
            return {...oldState};
          } else {
            return {
              ...oldState,
              index: oldState.index + 1,
              pressNotification: null,
            };
          }
        } else {
          return oldState;
        }
      }
    case 'PLAYERTOGGLEOPEN':
      return {...oldState, playerIsVisible: !oldState.playerIsVisible};
    case 'SETLIKE':
      function likesToString(likes) {
        switch (likes) {
          case true:
            return 'like';
          case false:
            return 'dislike';
          case null:
            return 'delete';
        }
      }
      const item = oldState.items[oldState.index];
      if (item) {
        analytics()
          .logEvent('change_likes', {
            likes: likesToString(action.likes),
            item: item.id,
          })
          .then(() => {
            const likeRef = firestore()
              .collection(`users/${auth().currentUser.uid}/likes`)
              .doc(item && item.id);
            const dislikeRef = firestore()
              .collection(`users/${auth().currentUser.uid}/dislikes`)
              .doc(item && item.id);
            switch (action.likes) {
              case false:
                likeRef.delete();
                dislikeRef.set({
                  duration: item.duration,
                  records: item.records,
                  isComment: item.isComment,
                  url: item.url,
                  genre: item.genre,
                  title: item.title,
                  updatedAt: new Date(),
                  artwork: item.artwork,
                  date: item.date,
                  postRange: item.postRange,
                  artist: firestore().collection('users').doc(item.artist.id),
                  tags: item.tags,
                });
                break;
              case true:
                dislikeRef.delete();
                likeRef.set({
                  updatedAt: new Date(),
                  duration: item.duration,
                  records: item.records,
                  isComment: item.isComment,
                  url: item.url,
                  genre: item.genre,
                  title: item.title,
                  artwork: item.artwork,
                  date: item.date,
                  postRange: item.postRange,
                  artist: firestore().collection('users').doc(item.artist.id),
                  tags: item.tags,
                });
                break;
              case null:
                dislikeRef.delete();
                likeRef.delete();
                break;
            }
          })
          .catch(error => {
            console.log(error);
          });
        const likeName = likesToString(action.likes);
        if (likeName !== "delete") SoundPlayer.playSoundFile(likeName, 'mp3');
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
    case 'RECORDRESET':
      return InitialEditorState;
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
