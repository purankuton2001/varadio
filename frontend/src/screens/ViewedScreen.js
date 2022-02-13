import React, {useState, useEffect} from 'react';
import {StyleSheet, View, ScrollView, Alert} from 'react-native';
import ContentsList from '../components/ContentsList';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function ViewedScreen(props) {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    let unsubscribe = () => {};
    const db = firestore();
    const ref = db
      .collection(`users/${auth().currentUser.uid}/viewed`)
      .orderBy("updatedAt", "desc");
    ref.get().then(
      snapshot => {
        const userposts = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          data.artist.get().then((a) => {
            const artist = a.data();
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
              artist,
            });
            setPosts(userposts);
            setLoading(false);
          })
        });
      },
      () => {
        setLoading(false);
        Alert.alert('読み込みに失敗しました。');
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
