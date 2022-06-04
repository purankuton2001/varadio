import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Alert, ScrollView, Text} from 'react-native';
import ContentsList from '../components/ContentsList';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import PostTrendList from '../components/PostTrendList';
import HomeTopTab from "../components/HomeTopTab";

export default function HomeScreen() {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [trends, setTrends] = useState([]);
  const [tab, setTab] = useState('recommend');
  const changeTab = t => {
    setTab(t)
  }

  function trendsfetch() {
    let unsubscribe = () => {};
    const db = firestore();
    const ref = db.collection(`trend_posts`);
    unsubscribe = ref.onSnapshot(
      snapshot => {
        const trendposts = [];
        snapshot.forEach(async (doc, index) => {
          const data = doc.data();
          const artist = await data.artist.get();
          trendposts.push({
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
          if (index === snapshot.size - 1) {
            setTrends(trendposts);
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
    return unsubscribe;
  }

  function postFetch() {
    setLoading(true);
    const db = firestore();
    const ref = auth().currentUser
      ? db.collection(`users/${auth().currentUser.uid}/recomends`)
      : db.collection('posts').limit(20).orderBy('viewedAmount', 'desc');
    ref.get().then(
      snapshot => {
        const userposts = [];
        snapshot.forEach(async (doc, index) => {
          const data = doc.data();
          if (data.url) {
            const artist = await data.artist.get();
            userposts.push({
              viewedAmount: data.viewedAmount,
              id: doc.id,
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
              postId: data.postId,
            });
          }
          if (index === snapshot.size - 1) {
            setPosts(userposts);
            setLoading(false);
          }
        });
      }
    );
  }
  async function followingFetch () {
    setLoading(true);
    const db = firestore();
    const ref = db.collection(`users/${auth().currentUser.uid}/follows`);
    const follows = await ref.get();
    const followPosts = [];
    follows.forEach(async (follow, followIndex) => {
      const d = await db
          .collection(`users/${follow.id}/posts`)
          .orderBy('date', 'desc')
          .get();
      const ps = d.docs.filter(fil => fil.data().hasOwnProperty('url'))
      ps.forEach(async (doc, index) =>{
            const data = doc.data();
            const artist = await data.artist.get();
            followPosts.push({
              viewedAmount: data.viewedAmount,
              id: doc.id,
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
              postId: data.postId,
            });
            if(index === ps.length - 1 && followIndex === follows.size - 1){
            followPosts.sort((a, b) => b-a);
            setPosts(followPosts);
            setLoading(false);}
      });
    })
  }

  useEffect(() => {
    if(tab === 'recommend'){
    postFetch();
    trendsfetch();
    }
    if(tab === 'following'){
      followingFetch();
    }
  }, [tab]);

  return (
    <View style={styles.container}>
      <ScrollView>
        <HomeTopTab tab={tab} changeTab={changeTab}/>
        {tab === 'recommend' && <PostTrendList items={trends} />}
        {tab === 'recommend' && <Text style={styles.text}>あなたへのおすすめ</Text>}
        <ContentsList items={posts} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingBottom: 56,
  },
  text: {
    paddingHorizontal: 20,
    marginTop: 24,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
});
