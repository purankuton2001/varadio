import React, {createContext, useEffect, useReducer} from 'react';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import Orientation from 'react-native-orientation';
import TrackPlayer from 'react-native-track-player';
import {playerReducer, editorReducer} from './src/reducer';
import {firebaseConfig} from './src/utils';

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
if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

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
