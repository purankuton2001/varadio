import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Alert, ScrollView} from 'react-native';
import HomeTopTab from '../components/HomeTopTab';
import ContentsList from '../components/ContentsList';
import PlayListRecommend from '../components/PlayListRecommend ';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function HomeScreen() {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);

  function postsfetch() {
    let unsubscribe3 = () => {};
    setLoading(true);
    const db = firestore();
    const ref = auth().currentUser
      ? db.collection(`users/${auth().currentUser.uid}/recomends`)
      : db.collection('ranking');
    unsubscribe3 = ref.onSnapshot(
      snapshot => {
        const userposts = [];
        snapshot.forEach(async doc => {
          const data = doc.data();
          if (data.url) {
            const artist = await data.artist.get();
            userposts.push({
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
            });
          }
          setPosts(userposts);
          setLoading(false);
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

  useEffect(() => {
    const unsubscribe = postsfetch();
    return unsubscribe;
  }, []);
  return (
    <View style={styles.container}>
      <HomeTopTab />
      <ScrollView>
        <PlayListRecommend />
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
});
