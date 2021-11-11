import React, {createContext, useEffect, useReducer} from 'react';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import Orientation from 'react-native-orientation';
import TrackPlayer from 'react-native-track-player';

import MainTabScreen from './src/screens/MainTabScreen';
import RecordPlayerScreen from './src/screens/RecordPlayerScreen';
import RecordCreateScreen from './src/screens/RecordCreateScreen';
import RecordEditScreen from './src/screens/RecordEditScreen';
import RecordPostScreen from './src/screens/RecordPostScreen';
import RecordAddScreen from './src/screens/RecordAddScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import SignInScreen from './src/screens/SignInScreen';
import PasswordScreen from './src/screens/PasswordScreen';
import PasswordDoneScreen from './src/screens/PasswordDoneScreen';
import TrimmingScreen from './src/screens/TrimmingScreen';
import SettingScreen from './src/screens/SettingScreen';
import ProfileEditScreen from './src/screens/ProfileEditScreen';
import firebase from '@react-native-firebase/app';

const Stack = createStackNavigator();

const InitialPlayerState = {
  likes: null,
  items: [],
  item: {},
  index: -1,
  playerIsVisible: false,
};
const InitialEditorState = {
  start: 0,
  end: 10,
  currentTime: 0,
  records: [],
  duration: 10,
};
export const PlayerContext = createContext(InitialPlayerState);
export const EditorContext = createContext(InitialEditorState);

Orientation.lockToPortrait();
const firebaseConfig = {
  apiKey: 'AIzaSyA5OGbz6Ti2e9SgbDgIKvaxpL_MSj3FZxA',
  authDomain: 'hitokoto-309511.firebaseapp.com',
  projectId: 'hitokoto-309511',
  storageBucket: 'hitokoto-309511.appspot.com',
  messagingSenderId: '56470386968',
  appId: '1:56470386968:web:a00d99c32e013139bc866d',
  measurementId: 'G-5VDCBVVEF3',
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}
const itemsUpdate = (items, index) => {
  TrackPlayer.reset().then(() => {
    const recordOptions = {
      ratingType: TrackPlayer.RATING_THUMBS_UP_DOWN,
      stopWithApp: true,
      previousIcon: require('./src/Icon/dislike_on.png'),
      nextIcon: require('./src/Icon/dislike_on.png'),
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

const playerReducer = (oldState, action) => {
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
const editorReducer = (oldState, action) => {
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
export default function App() {
  const dispatchTrackChange = () => {
    dispatch({type: 'TRACKCHANGE'});
  };

  useEffect(() => {
    TrackPlayer.setupPlayer().then(() => {
      TrackPlayer.addEventListener(
        'playback-track-changed',
        dispatchTrackChange,
      );
      TrackPlayer.addEventListener('remote-play', () => {
        TrackPlayer.play();
      });
      TrackPlayer.addEventListener('remote-pause', () => {
        TrackPlayer.pause();
      });
    });
  }, []);
  const [state, dispatch] = useReducer(playerReducer, InitialPlayerState);
  const [editorState, editorDispatch] = useReducer(
    editorReducer,
    InitialEditorState,
  );
  return (
    <PlayerContext.Provider value={{state, dispatch}}>
      <EditorContext.Provider value={{editorState, editorDispatch}}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}>
            <Stack.Screen
              name="Main"
              component={MainTabScreen}
              getId={({route}) => route && route.params}
              options={{
                headerShown: false,
                cardStyleInterpolator:
                  CardStyleInterpolators.forScaleFromCenterAndroid,
              }}
            />
            <Stack.Screen
              name="Player"
              component={RecordPlayerScreen}
              getId={({route}) => route && route.params}
              options={{
                headerShown: false,
                cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
              }}
            />
            <Stack.Screen
              name="RecordCreate"
              component={RecordCreateScreen}
              options={{
                cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
              }}
            />
            <Stack.Screen
              name="Trimming"
              component={TrimmingScreen}
              options={{
                cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
              }}
            />
            <Stack.Screen name="RecordEdit" component={RecordEditScreen} />
            <Stack.Screen name="RecordPost" component={RecordPostScreen} />
            <Stack.Screen name="RecordAdd" component={RecordAddScreen} />
            <Stack.Screen
              name="SignUp"
              component={SignUpScreen}
              options={{
                cardStyleInterpolator:
                  CardStyleInterpolators.forScaleFromCenterAndroid,
              }}
            />
            <Stack.Screen
              name="SignIn"
              component={SignInScreen}
              options={{
                cardStyleInterpolator:
                  CardStyleInterpolators.forScaleFromCenterAndroid,
              }}
            />
            <Stack.Screen name="Password" component={PasswordScreen} />
            <Stack.Screen name="Done" component={PasswordDoneScreen} />
            <Stack.Screen name="Setting" component={SettingScreen} />
            <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </EditorContext.Provider>
    </PlayerContext.Provider>
  );
}
