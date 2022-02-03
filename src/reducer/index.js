import TrackPlayer from 'react-native-track-player';
import analytics from '@react-native-firebase/analytics';

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
      return {items: action.data};
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
        return oldState;
      } else {
        if (oldState.items[oldState.index + 1]) {
          const item = {
            item_id: oldState.items[oldState.index + 1].id,
          };
          analytics().logViewItem({items: [item]});
        }
        interval = true;
        setTimeout(() => {
          interval = false;
        }, 500);
        if (oldState.first) {
          oldState.first = false;
          return oldState;
        } else {
          return {...oldState, index: oldState.index + 1};
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
