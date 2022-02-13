/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {StyleSheet, ScrollView, Alert, TouchableOpacity} from 'react-native';
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

  function playlistfetch() {
    if (auth().currentUser) {
      const db = firestore();
      const ref = id
      ? db
      .collection(`users/${id}/playLists`)
      .orderBy('date', 'desc')
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

  function postsfetch() {
    let unsubscribe3 = () => {};
    if (auth().currentUser) {
      const db = firestore();
      const ref = id
      ? db
      .collection(`users/${id}/posts`)
      .orderBy('date', 'desc')
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
                duration: data.duration,
                id: doc.id,
                title: data.title,
                artwork: data.artwork,
                date: data.date.toDate(),
                postRange: data.postRange,
                materialRange: data.materialRange,
                isComment: data.isComment,
                genre: data.genre,
                url: data.url,
                artist: artist.data(),
                tags: data.tags,
                records: data.records,
                playLists: data.playLists,
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
      ? db
      .collection(`users/${id}/records`)
      .orderBy('date', 'desc')
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
                duration: data.duration,
                id: doc.id,
                title: data.title,
                artwork: data.artwork,
                date: data.date.toDate(),
                postRange: data.postRange,
                materialRange: data.materialRange,
                isComment: data.isComment,
                genre: data.genre,
                url: data.url,
                artist: artist.data(),
                tags: data.tags,
                records: data.records,
                playLists: data.playLists,
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
      : db.doc(`users/${auth().currentUser.uid}`)
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
    const unsubscribe = auth().onAuthStateChanged(user => {
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
        headerRight: () => (
          (!id || id == auth().currentUser.uid) && <TouchableOpacity
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
    };
  }, [navigation, id]);
  return (
    <ScrollView style={styles.container}>
      <Profile profile={profile} id = {id}/>
      <Tab.Navigator
        sceneContainerStyle={{flex: 1}}
        tabBarOptions={{
          indicatorStyle: {backgroundColor: '#F2994A'},
          activeTintColor: '#F2994A',
          inactiveTintColor: '#A7A7A7',
        }}>
        <Tab.Screen
          name="投稿"
          children={() => <ContentsList items={posts} />}
        />
        <Tab.Screen
          name="レコード"
          children={() => <RecordsList items={records} />}
        />
        <Tab.Screen
          name="プレイリスト"
          children={() => <UserPlayList id = {id} playLists={playLists} />}
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
