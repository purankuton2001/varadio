/* eslint-disable react-hooks/exhaustive-deps */
import React, {createContext, useEffect, useReducer, useRef} from 'react';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import Orientation from 'react-native-orientation';
import TrackPlayer from 'react-native-track-player';
import {playerReducer, editorReducer} from './src/reducer';
import {firebaseConfig} from './src/utils';
import auth from '@react-native-firebase/auth';
import {Alert} from 'react-native';

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
import firestore from '@react-native-firebase/firestore';
import analytics from '@react-native-firebase/analytics';
import messaging from '@react-native-firebase/messaging';

const Stack = createStackNavigator();

const InitialPlayerState = {
  likes: null,
  items: [],
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
  useEffect(() => {
    // Assume a message-notification contains a "type" property in the data payload of the screen to open

    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
    });

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification,
          );
        }
      });
  }, []);
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);

  const dispatchTrackChange = () => {
    dispatch({type: 'TRACKCHANGE'});
  };

  async function init() {
    const enabled = await messaging().hasPermission();
    if (enabled) {
      this.initFcm();
    } else {
      try {
        await messaging().requestPermission();
        this.initFcm();
      } catch (e) {
        console.log(e);
      }
    }
  }
  useEffect(() => {
    init();
  }, []);
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        analytics().setUserId(auth().currentUser.uid);
      }
      return unsubscribe;
    });
  }, []);

  useEffect(() => {
    const recfunc = () => {
      const rec_ref = firestore().collection(
        `users/${auth().currentUser.uid}/recommends`,
      );
      rec_ref.get().then(recs => {
        dispatch({type: 'RECOMMENDS', items: recs});
      });
    };
    TrackPlayer.setupPlayer().then(() => {
      const rec_ref = auth().currentUser
        ? firestore().collection(`users/${auth().currentUser.uid}/recommends`)
        : firestore().collection('rankings');
      rec_ref.get().then(recs => {
        dispatch({type: 'RECOMMENDS', items: recs});
      });
      const recordOptions = {
        ratingType: TrackPlayer.RATING_THUMBS_UP_DOWN,
        stopWithApp: true,
        previousIcon: require('./src/Icon/like_on.png'),
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
      TrackPlayer.addEventListener('remote-next', () => {
        dispatch({type: 'SETLIKE', likes: true});
      });
      TrackPlayer.addEventListener('remote-previous', () => {
        dispatch({type: 'SETLIKE', likes: false});
      });
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
  const {item, likes} = state;
  const [editorState, editorDispatch] = useReducer(
    editorReducer,
    InitialEditorState,
  );
  const routeNameRef = useRef();
  const navigationRef = useRef();
  return (
    <PlayerContext.Provider value={{state, dispatch}}>
      <EditorContext.Provider value={{editorState, editorDispatch}}>
        <NavigationContainer
          ref={navigationRef}
          onReady={() => {
            routeNameRef.current = navigationRef.current.getCurrentRoute().name;
          }}
          onStateChange={async () => {
            const previousRouteName = routeNameRef.current;
            const currentRouteName =
              navigationRef.current.getCurrentRoute().name;

            if (previousRouteName !== currentRouteName) {
              await analytics().logScreenView({
                screen_name: currentRouteName,
                screen_class: currentRouteName,
              });
            }
            routeNameRef.current = currentRouteName;
          }}>
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
            {/* <Stack.Screen
              name="Player"
              component={RecordPlayerScreen}
              getId={({route}) => route && route.params}
              options={{
                headerShown: false,
                cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
              }}
            /> */}
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
