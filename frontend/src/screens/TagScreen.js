import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import {BottomSheet} from 'react-native-elements';
import ContentsList from '../components/ContentsList';
import Tag from '../components/Tag';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/SimpleLineIcons';

export default function TagScreen(props) {
  const {route, navigation} = props;
  const {item} = route.params;
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [tagItem, setTagItem] = useState(item);

  useEffect(() => {
    if (item) {
      let unsubscribe = () => {};
      const db = firestore();
      const userposts = [];
      db.collection('tags')
        .doc(item.title)
        .collection('posts')
        .get()
        .then(posts => {
          let first = true;
          posts.forEach(post => {
            const data = post.data();
            if (first) {
              const tagObj = tagItem;
              tagObj.artwork = data.artwork;
              setTagItem(tagObj);
              first = false;
            }
            data.artist.get().then(a => {
              const artist = a.data();
              userposts.push({
                id: post.id,
                title: data.title,
                artwork: data.artwork,
                date: data.date.toDate(),
                postRange: data.postRange,
                isComment: data.isComment,
                genre: data.genre,
                url: data.url,
                artist,
                tags: data.tags,
                records: data.records,
              });
              console.log(userposts);
              setItems(userposts);
              setLoading(false);
            });
          });
        });
      return unsubscribe;
    }
  }, [item]);

  return (
    <ScrollView style={styles.container}>
      <Tag item={tagItem} items={items} />
      <ContentsList items={items} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  bottomButton: {
    width: '100%',
    height: 48,
    padding: 12,
    borderWidth: 0.5,
    borderColor: '#A7A7A7',
  },
  bottomButtonText: {
    height: 24,
    fontSize: 18,
  },
  bottomContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
});
