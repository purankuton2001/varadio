/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {StyleSheet, ScrollView, Alert, TouchableOpacity} from 'react-native';
import ContentsList from '../components/ContentsList';
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
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState();
  const [posts, setPosts] = useState();
  const [playLists, setPlayLists] = useState();
  function playlistfetch() {
    if (auth().currentUser) {
      const db = firestore();
      const ref = db
        .collection(`users/${auth().currentUser.uid}/playLists`)
        .orderBy('date', 'desc');
      const subscribe = ref.onSnapshot(
        snapshot => {
          const userPlayLists = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            data.artist.get().then(artist => {
              userPlayLists.push({
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
      const ref = db
        .collection(`users/${auth().currentUser.uid}/posts`)
        .orderBy('date', 'desc');
      unsubscribe3 = ref.onSnapshot(
        snapshot => {
          let count = 0;
          const userposts = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            if (data.url) {
              data.artist.get().then(artist => {
                userposts.push({
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
              });
            }
            count++;
            if (count >= snapshot.size) {
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

  function userfetch() {
    if (auth().currentUser) {
      const db = firestore();
      const ref = db.collection('users').doc(`${auth().currentUser.uid}`);
      ref.get().then(doc => {
        const data = doc.data();
        setProfile({
          name: data.name,
          profileImage: data.profileImage,
          description: data.description,
          id: data.id,
          link: data.link,
          location: data.location,
        });
        setLoading(false);
      });
    }
  }

  useEffect(() => {
    let unsubscribe2 = () => {};
    let unsubscribe3 = () => {};
    const unsubscribe = auth().onAuthStateChanged(user => {
      unsubscribe2 = playlistfetch();
      userfetch();
      unsubscribe3 = postsfetch();
      if (!user) {
        navigation.reset({
          index: 0,
          routes: [{name: 'NoAccount'}],
        });
      }
      navigation.setOptions({
        headerRight: () => (
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
    });
    return () => {
      unsubscribe2;
      unsubscribe;
      unsubscribe3;
    };
  }, [navigation]);
  return (
    <ScrollView style={styles.container}>
      <Profile profile={profile} />
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
          name="プレイリスト"
          children={() => <UserPlayList playLists={playLists} />}
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
