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
    if (auth().currentUser) {
      const db = firestore();
      const ref = db.collection('posts').orderBy('date', 'desc');
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
