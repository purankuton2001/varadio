import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Alert, ScrollView} from 'react-native';
import HomeTopTab from '../components/HomeTopTab';
import ContentsList from '../components/ContentsList';
import PlayListRecommend from '../components/PlayListRecommend ';
import firestore from '@react-native-firebase/firestore';

export default function HomeScreen() {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    const db = firestore();
    let unsubscribe = () => {};
    const ref = db.collection('posts').orderBy('createdAt', 'desc');
    unsubscribe = ref.onSnapshot(
      snapshot => {
        const userposts = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          userposts.push({
            id: doc.id,
            title: data.title,
            imageUrl: data.imageUrl,
            createdAt: data.createdAt.toDate(),
            createdBy: data.createdBy,
          });
        });
        setPosts(userposts);
        setLoading(false);
      },
      () => {
        setLoading(false);
        Alert.alert('メモの読み込みに失敗しました。');
      },
    );
    return unsubscribe;
  });
  return (
    <View style={styles.container}>
      <HomeTopTab />
      <ScrollView>
        <PlayListRecommend />
        <ContentsList posts={posts} />
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
