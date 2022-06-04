/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {createContext, useEffect, useReducer, useRef} from 'react';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import Orientation from 'react-native-orientation';
import TrackPlayer from 'react-native-track-player';
import {playerReducer, editorReducer} from './src/reducer';
import {firebaseConfig} from './utils/firebaseConfig';
import auth from '@react-native-firebase/auth';
import {Alert} from 'react-native';
import {useMoralis} from 'react-moralis';

import MainTabScreen from './src/screens/MainTabScreen';
import RecordSellScreen from './src/screens/RecordSellScreen';
import RecordCreateScreen from './src/screens/RecordCreateScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RecordEditScreen from './src/screens/RecordEditScreen';
import RecordSellPostScreen from './src/screens/RecordSellPostScreen';
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
import LoginScreen from './Components/CryptoAuth';

const Stack = createStackNavigator();

const InitialPlayerState = {
  likes: null,
  items: [],
  index: -1,
  playerIsVisible: false,
  pressNotification: null,
  pressNotificationFollow: null,
  pressNotificationSell: null,
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
  const {Moralis} = useMoralis();

  useEffect(() => {
    Moralis.User.currentAsync().then(function (user) {
      console.log(user.attributes.accounts[0]);
      Moralis.User.become(user.getSessionToken());
    });
  }, []);

  useEffect(() => {
    // Assume a message-notification contains a "type" property in the data payload of the screen to open
    messaging().onNotificationOpenedApp(async remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
      const {data} = remoteMessage;
      switch (data.type) {
        case 'like':
          dispatch({
            type: 'CONTENTSSELECT',
            items: [JSON.parse(data.where)],
            index: 0,
          });
          break;
        case 'disLike':
          dispatch({
            type: 'CONTENTSSELECT',
            items: [JSON.parse(data.where)],
            index: 0,
          });
          break;
        case 'comment': {
          const where = JSON.parse(data.where);
          const res = await firestore().doc(`posts/${where.itemId}`).get()
          const post = {...res.data(), id: res.id};
          const artist = await post.artist.get();
          post.artist = artist.data();
          post.date = post.date.toDate();
          where.createdAt = where.createdAt.toDate();
          dispatch({
            type: 'PRESSNOTIFICATIONCOMMENT',
            items: [post],
            index: 0,
            pressNotification: where,
          });
          break;
        }
        case 'reply': {
          const where = JSON.parse(data.where);
          firestore()
            .doc(`posts/${where.itemId}`)
            .get()
            .then(res => {
              const data = res.data();
              data.artist.get().then((s) => {
                const artist = s.data();
                data.artist = artist;
                dispatch({
                  type: 'PRESSNOTIFICATIONCOMMENT',
                  items: [post],
                  index: 0,
                  pressNotification: where,
                });
              })
            });
          break;
        }
        case 'follow':
          dispatch({
            type: 'PRESSNOTIFICATIONFOLLOW',
            pressNotification: data.userId,
          });
          break;
        case 'sell':
          dispatch({
            type: 'PRESSNOTIFICATIONSELL',
            pressNotification: JSON.parse(data.where),
          });
          break;
      }
    });

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          const {data} = remoteMessage;
          switch (data.type) {
            case 'like':
              dispatch({
                type: 'CONTENTSSELECT',
                items: [JSON.parse(data.where)],
                index: 0,
              });
              break;
            case 'disLike':
              dispatch({
                type: 'CONTENTSSELECT',
                items: [JSON.parse(data.where)],
                index: 0,
              });
              break;
            case 'comment': {
              const where = JSON.parse(data.where);
              firestore()
                .doc(`posts/${where.itemId}`)
                .get()
                .then(res => {
                  const post = res.data();
                  dispatch({
                    type: 'PRESSNOTIFICATIONCOMMENT',
                    items: [post],
                    index: 0,
                    pressNotification: where,
                  });
                });
              break;
            }
            case 'reply': {
              const where = JSON.parse(data.where);
              firestore()
                .doc(`posts/${where.itemId}`)
                .get()
                .then(res => {
                  const post = res.data();
                  dispatch({
                    type: 'PRESSNOTIFICATIONCOMMENT',
                    items: [post],
                    index: 0,
                    pressNotification: where,
                  });
                });
              break;
            }
            case 'follow':
              dispatch({
                type: 'PRESSNOTIFICATIONFOLLOW',
                pressNotification: data.userId,
              });
              break;
            case 'sell':
              dispatch({
                type: 'PRESSNOTIFICATIONSELL',
                pressNotification: JSON.parse(data.where),
              });
              break;
          }
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
  const dispatchRecommends = items => {
    dispatch({type: 'RECOMMENDS', items});
  };
  async function saveTokenToDatabase(token) {
    // Assume user is already signed in
    const userId = auth().currentUser.uid;

    // Add the token to the users datastore
    await firestore()
      .collection('users')
      .doc(userId)
      .update({
        tokens: firestore.FieldValue.arrayUnion(token),
      });
  }
  async function init() {
    const enabled = await messaging().hasPermission();
    if (!enabled) {
      try {
        await messaging().requestPermission();
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
        messaging()
          .getToken()
          .then(token => {
            if(token)saveTokenToDatabase(token);
          });
      }
      return unsubscribe;
    });
  }, []);

  useEffect(() => {
    TrackPlayer.setupPlayer().then(async () => {
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
      const rec_ref = auth().currentUser
        ? firestore().collection(`users/${auth().currentUser.uid}/recomends`)
        : firestore().collection('ranking');
      const recs = await rec_ref.get();
      const records = [];
      recs.forEach(async rec => {
        const data = rec.data();
        const artist = await data.artist.get();
        records.push({
          id: rec.id,
          title: data.title,
          artwork: data.artwork,
          date: data.date.toDate(),
          postRange: data.postRange,
          duration: data.duration,
          isComment: data.isComment,
          genre: data.genre,
          url: data.url,
          artist: artist.data(),
          tags: data.tags,
          records: data.records,
          playLists: data.playLists,
        });
        recs.size === records.length ? dispatchRecommends(records) : null;
      });
    });
  }, []);

  const [state, dispatch] = useReducer(playerReducer, InitialPlayerState);
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
            const currentRouteName = navigationRef.current.getCurrentRoute()
              .name;

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
            <Stack.Screen name="RecordSell" component={RecordSellScreen} />
            <Stack.Screen
              name="RecordSellPost"
              component={RecordSellPostScreen}
            />
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
            <Stack.Screen name="CryptoAuth" component={LoginScreen} />
            <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </EditorContext.Provider>
    </PlayerContext.Provider>
  );
}
