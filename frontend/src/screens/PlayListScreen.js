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
import PlayList from '../components/PlayList';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/SimpleLineIcons';

export default function PlayListScreen(props) {
  const {route, navigation} = props;
  const {item} = route.params;
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [isvisible, setIsvisible] = useState(false);

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
            data.artist.get().then(a => {
              const artist = a.data();
              userposts.push({
                id: posts[i],
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
                postId: data.postId,
              });
              if (i === posts.length - 1) {
                console.log(userposts);
                setItems(userposts);
                setLoading(false);
              }
            });
          });
      }
      return unsubscribe;
    }
  }, [item]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        item.artist.id == auth().currentUser.uid && (
          <View>
            <TouchableOpacity
              style={{right: 8}}
              onPress={() => {
                setIsvisible(true);
              }}>
              <Icon name="options-vertical" size={20} />
            </TouchableOpacity>
            <BottomSheet
              isVisible={isvisible}
              onBackdropPress={() => {
                setIsvisible(false);
              }}>
              <View style={styles.bottomContainer}>
                <TouchableOpacity
                  style={styles.bottomButton}
                  onPress={() => {
                    navigation.navigate('PlayListEdit', {
                      playlist: item,
                      items,
                    });
                  }}>
                  <Text style={styles.bottomButtonText}>
                    プレイリストを編集する
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.bottomButton}
                  onPress={() => {
                    firestore()
                      .doc(
                        `users/${auth().currentUser.uid}/playLists/${item.id}`,
                      )
                      .delete()
                      .then(() => {
                        navigation.goBack();
                      });
                  }}>
                  <Text style={[styles.bottomButtonText, {color: 'red'}]}>
                    プレイリストを削除する
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.bottomButton}
                  onPress={() => {
                    setIsvisible(false);
                  }}>
                  <Text style={styles.bottomButtonText}>閉じる</Text>
                </TouchableOpacity>
              </View>
            </BottomSheet>
          </View>
        ),
    });
  }, [items, isvisible]);

  return (
    <ScrollView style={styles.container}>
      <PlayList item={item} items={items} />
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
