import React, {useState, useEffect} from 'react';
import {StyleSheet, ScrollView} from 'react-native';
import DraggableList from '../components/DraggableList';
// import ContentsList from '../components/ContentsList';
import PlayList from '../components/PlayList';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function PlayListScreen(props) {
  const {route} = props;
  const {item} = route.params;
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (item) {
      let unsubscribe = () => {};
      const db = firestore();
      const {posts} = item;
      const userposts = [];
      for (let i = 0; i < posts.length; i++) {
        db.collection('posts')
          .doc(posts[i])
          .get()
          .then(post => {
            const data = post.data();
            userposts.push({
              id: posts[i],
              title: data.title,
              artwork: data.artwork,
              date: data.date.toDate(),
              postRange: data.postRange,
              materialRange: data.materialRange,
              isComment: data.isComment,
              genre: data.genre,
              url: data.url,
              artist: data.artist,
              tags: data.tags,
              records: data.records,
            });
            if (i === posts.length - 1) {
              console.log(userposts);
              setItems(userposts);
              setLoading(false);
            }
          });
      }
      return unsubscribe;
    }
  }, [item]);

  return (
    <ScrollView style={styles.container}>
      <PlayList item={item} items={items} />
      {/* <ContentsList items={items} /> */}
      <DraggableList
        items={items}
        dragEnd={({data}) => {
          const ref = firestore().doc(
            `users/${auth().currentUser.uid}/playLists/${item.id}`,
          );
          setItems(data);
          let newItems = [];
          for (let i = 0; i < data.length; i++) {
            newItems.push(data[i].id);
            if (i === data.length - 1) {
              ref.update({
                posts: newItems,
              });
            }
          }
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
