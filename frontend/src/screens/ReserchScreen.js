import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet} from 'react-native';
import {SearchBar} from 'react-native-elements';
import {View} from 'react-native';
import TrendList from '../components/TrendList';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {REACT_APP_ALGOLIA_ID, REACT_APP_ADMIN_API_KEY} from '@env';
import ContentsList from '../components/ContentsList';

const Tab = createMaterialTopTabNavigator();

export default function ReserchScreen({navigation}) {
  const [resultPosts, setResultPosts] = useState([]);
  const algoliasearch = require('algoliasearch');
  const client = algoliasearch(REACT_APP_ALGOLIA_ID, REACT_APP_ADMIN_API_KEY);
  const index = client.initIndex('Varadio');

  async function onSearch(e) {
    let tempResults = [];
    let resultPostsArray = [];
    await index.search(e).then(responses => {
      tempResults = responses.hits;
    });
    tempResults.forEach(async (data, ix) => {
      const artist = await firestore().doc(data.artist.value).get();
      resultPostsArray.push({
        viewedAmount: data.viewedAmount,
        duration: data.duration,
        id: data.objectID,
        title: data.title,
        artwork: data.artwork,
        date: new Date(data.date.value._seconds * 1000),
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
      if (tempResults.length == ix + 1) {
        setResultPosts(resultPostsArray);
        console.log(resultPosts);
        setLoading(false);
      }
    });
  }

  const [records, setRecords] = useState();
  const [tags, setTags] = useState();
  const [playLists, setPlayLists] = useState();
  const [loading, setLoading] = useState();
  function recordsfetch() {
    let unsubscribe = () => {};
    const db = firestore();
    const ref = db.collection(`trend_records`);
    unsubscribe = ref.onSnapshot(
      snapshot => {
        const trendrecords = [];
        snapshot.forEach(async (doc, index) => {
          const recordPosts = [];
          const data = doc.data();
          const artist = await data.artist.get();
          const postList = await firestore()
            .collection(`records/${doc.id}/posts`)
            .get();
          postList.forEach(async (post, postIndex) => {
            const postData = post.data();
            const postArtist = await postData.artist.get();
            console.log(postArtist.data());
            recordPosts.push({
              viewedAmount: postData.viewedAmount,
              duration: postData.duration,
              id: doc.id,
              title: postData.title,
              artwork: postData.artwork,
              date: postData.date.toDate(),
              postRange: postData.postRange,
              isComment: postData.isComment,
              genre: postData.genre,
              url: postData.url,
              artist: postArtist.data(),
              tags: postData.tags,
              records: postData.records,
              playLists: postData.playLists,
              postId: postData.postId,
            });
            if (postList.size === postIndex + 1) {
              trendrecords.push({
                recordPosts,
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
                playLists: data.playLists,
                itemId: data.itemId,
                amount: data.amount,
              });
              if (snapshot.size === index + 1) {
                console.log(trendrecords);
                setRecords(trendrecords);
                setLoading(false);
              }
            }
          });
        });
      },
      err => {
        console.log(err);
        setLoading(false);
        Alert.alert('データの読み込みに失敗しました。');
      },
    );
    return unsubscribe;
  }
  function playListsfetch() {
    let unsubscribe = () => {};
    const db = firestore();
    const ref = db.collection(`trend_playlists`);
    unsubscribe = ref.onSnapshot(
      snapshot => {
        const trendplayLists = [];
        snapshot.forEach(async (doc, index) => {
          const recordPosts = [];
          const data = doc.data();
          const artist = await data.artist.get();
          const postList = data.posts;
          postList.forEach(async (post, postIndex) => {
            const postData = await (
              await firestore().doc(`posts/${post}`).get()
            ).data();
            const postArtist = await postData.artist.get();
            recordPosts.push({
              viewedAmount: postData.viewedAmount,
              duration: postData.duration,
              id: doc.id,
              title: postData.title,
              artwork: postData.artwork,
              date: postData.date.toDate(),
              postRange: postData.postRange,
              isComment: postData.isComment,
              genre: postData.genre,
              url: postData.url,
              artist: postArtist.data(),
              tags: postData.tags,
              records: postData.records,
              playLists: postData.playLists,
              postId: postData.postId,
            });
            if (postList.length === postIndex + 1) {
              trendplayLists.push({
                postRange: data.postRange,
                id: doc.id,
                title: data.title,
                artwork: data.artwork,
                artist: artist.data(),
                description: data.description,
                date: data.date.toDate(),
                link: data.link,
                posts: data.posts,
                recordPosts,
              });
              if (snapshot.size === index + 1) {
                console.log(trendplayLists);
                setPlayLists(trendplayLists);
                setLoading(false);
              }
            }
          });
        });
      },
      err => {
        console.log(err);
        setLoading(false);
        Alert.alert('データの読み込みに失敗しました。');
      },
    );
    return unsubscribe;
  }
  function tagsfetch() {
    let unsubscribe = () => {};
    const db = firestore();
    const ref = db.collection(`trend_tags`);
    unsubscribe = ref.onSnapshot(
      snapshot => {
        const trendtags = [];
        snapshot.forEach(async (doc, index) => {
          const recordPosts = [];
          const data = doc.data();
          const postList = await firestore()
            .collection(`tags/${doc.id}/posts`)
            .get();
          postList.forEach(async (post, postIndex) => {
            const postData = post.data();
            const postArtist = await postData.artist.get();
            recordPosts.push({
              viewedAmount: postData.viewedAmount,
              duration: postData.duration,
              id: doc.id,
              title: postData.title,
              artwork: postData.artwork,
              date: postData.date.toDate(),
              postRange: postData.postRange,
              isComment: postData.isComment,
              genre: postData.genre,
              url: postData.url,
              artist: postArtist.data(),
              tags: postData.tags,
              records: postData.records,
              playLists: postData.playLists,
              postId: postData.postId,
            });
            if (postList.size === postIndex + 1) {
              trendtags.push({
                title: doc.id,
                recordPosts,
              });
              if (snapshot.size === index + 1) {
                console.log(trendtags);
                setTags(trendtags);
                setLoading(false);
              }
            }
          });
        });
      },
      err => {
        console.log(err);
        setLoading(false);
        Alert.alert('データの読み込みに失敗しました。');
      },
    );
    return unsubscribe;
  }
  useEffect(() => {
    let unsubscribe = () => {};
    let unsubscribe2 = () => {};
    let unsubscribe3 = () => {};
    unsubscribe = recordsfetch();
    unsubscribe2 = tagsfetch();
    unsubscribe3 = playListsfetch();

    return () => {
      unsubscribe;
      unsubscribe2;
      unsubscribe3;
    };
  }, []);
  const [state, setState] = useState('');
  const updateSearch = search => {
    onSearch(search);
    setState(search);
  };
  return (
    <View style={styles.container}>
      <SearchBar
        style={styles.serch}
        placeholder="Serch Contents"
        onChangeText={updateSearch}
        value={state}
        lightTheme
        showLoading
        showCancel
        cancelButtonProps={{fontSize: 16}}
        onBlur={() => {
          console.log('cancel');
        }}
        cancelButtonTitle="test"
      />
      {state !== '' && <ContentsList items={resultPosts} />}
      {state === '' && (
        <Tab.Navigator
          sceneContainerStyle={{flex: 1}}
          tabBarOptions={{
            indicatorStyle: {backgroundColor: '#F2994A'},
            activeTintColor: '#F2994A',
            inactiveTintColor: '#A7A7A7',
          }}>
          <Tab.Screen
            name="record"
            children={() => <TrendList items={records} tab="Record" />}
          />
          <Tab.Screen
            name="tag"
            children={() => <TrendList items={tags} tab="Tag" />}
          />
          <Tab.Screen
            name="playlist"
            children={() => <TrendList items={playLists} tab="PlayList" />}
          />
        </Tab.Navigator>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
