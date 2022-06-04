/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {StyleSheet, ScrollView, Alert, TouchableOpacity} from 'react-native';
import SellsList from '../components/SellsList';
import ContentsList from '../components/ContentsList';
import RecordsList from '../components/RecordsList';
import UserPlayList from '../components/UserPlayList';
import Profile from '../components/Profile';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();

export default function ProfileScreen(props) {
  const navigation = useNavigation();
  const id = props?.route?.params?.id;
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState();
  const [posts, setPosts] = useState();
  const [records, setRecords] = useState();
  const [playLists, setPlayLists] = useState();
  const [sells, setSells] = useState();

  function playlistfetch() {
    if (auth().currentUser) {
      const db = firestore();
      const ref = id
        ? db.collection(`users/${id}/playLists`).orderBy('date', 'desc')
        : db
            .collection(`users/${auth().currentUser.uid}/playLists`)
            .orderBy('date', 'desc');
      const subscribe = ref.onSnapshot(
        snapshot => {
          const userPlayLists = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            data.artist.get().then(artist => {
              userPlayLists.push({
                postRange: data.postRange,
                id: doc.id,
                title: data.title,
                artwork: data.artwork,
                artist: artist.data(),
                description: data.description,
                date: data.date.toDate(),
                link: data.link,
                posts: data.posts,
              });
            });
          });
          setPlayLists(userPlayLists);
          setLoading(false);
        },
        () => {
          setLoading(false);
          Alert.alert('データの読み込みに失敗しました。');
        },
      );
      return subscribe;
    }
  }
  function sellfetch() {
    if (auth().currentUser) {
      const db = firestore();
      const ref = id
        ? db.collection(`users/${id}/sells`).orderBy('date', 'desc')
        : db
            .collection(`users/${auth().currentUser.uid}/sells`)
            .orderBy('date', 'desc');
      const subscribe = ref.onSnapshot(
        snapshot => {
          const userSells = [];
          snapshot.forEach((doc, index) => {
            const data = doc.data();
            data.seller?.get().then(res => {
              firestore()
                .doc(`records/${data.recordId}`)
                .get()
                .then(re => {
                  const record = re.data();
                  const seller = res.data();
                  userSells.push({
                    record,
                    id: doc.id,
                    date: data.date.toDate(),
                    seller,
                    amount: data.amount,
                    price: data.price,
                    sellId: data.sellId,
                  });
                  if (index === snapshot.size - 1) {
                    setSells(userSells);
                    setLoading(false);
                  }
                });
            });
          });
        },
        () => {
          setLoading(false);
          Alert.alert('データの読み込みに失敗しました。');
        },
      );
      return subscribe;
    }
  }

  function postsfetch() {
    let unsubscribe3 = () => {};
    if (auth().currentUser) {
      const db = firestore();
      const ref = id
        ? db.collection(`users/${id}/posts`).orderBy('date', 'desc')
        : db
            .collection(`users/${auth().currentUser.uid}/posts`)
            .orderBy('date', 'desc');
      unsubscribe3 = ref.onSnapshot(
        snapshot => {
          const userposts = [];
          snapshot.forEach(async doc => {
            const data = doc.data();
            if (data.url) {
              const artist = await data.artist.get();
              userposts.push({
                viewedAmount: data.viewedAmount,
                duration: data.duration,
                id: doc.id,
                title: data.title,
                artwork: data.artwork,
                date: data.date.toDate(),
                postRange: data.postRange,
                isComment: data.isComment,
                genre: data.genre,
                url: data.url,
                artist: artist.data(),
                tags: data.tags,
                records: data.records,
                playLists: data.playLists,
                postId: data.postId,
              });
              setPosts(userposts);
              setLoading(false);
            }
          });
        },
        err => {
          console.log(err);
          setLoading(false);
          Alert.alert('データの読み込みに失敗しました。');
        },
      );
      return unsubscribe3;
    }
  }
  function recordsfetch() {
    let unsubscribe3 = () => {};
    if (auth().currentUser) {
      const db = firestore();
      const ref = id
        ? db.collection(`users/${id}/records`).orderBy('date', 'desc')
        : db
            .collection(`users/${auth().currentUser.uid}/records`)
            .orderBy('date', 'desc');
      unsubscribe3 = ref.onSnapshot(
        snapshot => {
          const userrecords = [];
          snapshot.forEach(async doc => {
            const data = doc.data();
            if (data.url) {
              const artist = await data.artist.get();
              userrecords.push({
                id: doc.id,
                viewedAmount: data.viewedAmount,
                title: data.title,
                artwork: data.artwork,
                date: data.date.toDate(),
                postRange: data.postRange,
                isComment: data.isComment,
                genre: data.genre,
                url: data.url,
                artist: artist.data(),
                tags: data.tags,
                playLists: data.playLists,
                itemId: data.itemId,
                amount: data.amount,
              });
              setRecords(userrecords);
              setLoading(false);
            }
          });
        },
        err => {
          console.log(err);
          setLoading(false);
          Alert.alert('データの読み込みに失敗しました。');
        },
      );
      return unsubscribe3;
    }
  }

  function userfetch() {
    if (auth().currentUser) {
      const db = firestore();
      const ref = id
        ? db.doc(`users/${id}`)
        : db.doc(`users/${auth().currentUser.uid}`);
      ref.get().then(doc => {
        const data = doc.data();
        setProfile({
          name: data.name,
          profileImage: data.profileImage,
          description: data.description,
          id: data.id,
          link: data.link,
        });
        setLoading(false);
      });
    }
  }

  useEffect(() => {
    let unsubscribe2 = () => {};
    let unsubscribe3 = () => {};
    let unsubscribe4 = () => {};
    let unsubscribe5 = () => {};
    const unsubscribe = auth().onAuthStateChanged(user => {
      unsubscribe5 = sellfetch();
      unsubscribe2 = playlistfetch();
      userfetch();
      unsubscribe3 = postsfetch();
      unsubscribe4 = recordsfetch();
      if (!user && !id) {
        navigation.reset({
          index: 0,
          routes: [{name: 'NoAccount'}],
        });
      }
    });
    navigation.setOptions({
      headerRight: () =>
        (!id || id == auth().currentUser.uid) && (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Setting');
            }}>
            <Icon
              name="cog-outline"
              style={{marginRight: 20}}
              size={24}
              color="#A7A7A7"
            />
          </TouchableOpacity>
        ),
    });
    return () => {
      unsubscribe2;
      unsubscribe;
      unsubscribe3;
      unsubscribe4;
      unsubscribe5;
    };
  }, [navigation, id]);
  return (
    <ScrollView style={styles.container}>
      <Profile profile={profile} id={id} />
      <Tab.Navigator
        sceneContainerStyle={{flex: 1}}
        tabBarOptions={{
          indicatorStyle: {backgroundColor: '#F2994A'},
          activeTintColor: '#F2994A',
          inactiveTintColor: '#A7A7A7',
        }}>
        <Tab.Screen
          name="post"
          children={() => <ContentsList items={posts} />}
        />
        <Tab.Screen
          name="record"
          children={() => <RecordsList items={records} />}
        />
        <Tab.Screen name="sell" children={() => <SellsList items={sells} />} />
        <Tab.Screen
          name="playlist"
          children={() => <UserPlayList id={id} playLists={playLists} />}
        />
      </Tab.Navigator>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
