import TrackPlayer from 'react-native-track-player';

const itemsUpdate = (items, index) => {
  TrackPlayer.reset().then(() => {
    const recordOptions = {
      ratingType: TrackPlayer.RATING_THUMBS_UP_DOWN,
      stopWithApp: true,
      previousIcon: require('../Icon/like_on.png'),
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
    TrackPlayer.updateOptions(recordOptions);
    const item = [];
    items.forEach(i => {
      item.push({
        playLists: i.playLists,
        duration: i.duration,
        id: i.id,
        title: i.title,
        url: i.url,
        genre: i.genre,
        artwork: i.artwork,
        date: i.date,
        artist: i.artist.name,
      });
    });
    TrackPlayer.add(item).then(() => {
      TrackPlayer.play();
    });
  });
  return {index, items, item: items[index], playerIsVisible: true};
};

export const playerReducer = (oldState, action) => {
  console.log(oldState);
  console.log(action);
  switch (action.type) {
    case 'ITEMSUPDATE':
      return {items: action.data};
    case 'CONTENTSSELECT':
      const k = itemsUpdate(action.items, action.index);
      return k;
    case 'TRACKCHANGE':
      return {...oldState, index: oldState.index + 1};
    case 'PLAYERTOGGLEOPEN':
      return {...oldState, playerIsVisible: !oldState.playerIsVisible};
    case 'SETLIKE':
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
