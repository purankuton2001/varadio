import React, {useState, useEffect} from 'react';
import {StyleSheet, View, ScrollView, Alert} from 'react-native';
import ContentsList from '../components/ContentsList';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function PlayListScreen(props) {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    let unsubscribe = () => {};
    const db = firestore();
    const ref = db
      .collection(`users/${auth().currentUser.uid}/likes`)
      .orderBy('date', 'desc');
    ref.get().then(
      snapshot => {
        const userposts = [];
        snapshot.forEach(doc => {
          const data = doc.data();
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
            artist: data.artist,
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
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView>
        <ContentsList items={posts} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
