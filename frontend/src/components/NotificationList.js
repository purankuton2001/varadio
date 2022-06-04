import React, {useEffect, useState, useContext} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import {PlayerContext} from '../../App';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {dateToString} from '../utils';
import {id} from 'date-fns/locale';
import {TouchableOpacity} from 'react-native-gesture-handler';

export default function NotificationList() {
  const {state, dispatch} = useContext(PlayerContext);
  const handlePress = async data => {
    switch (data.type) {
      case 'like':
        dispatch({
          type: 'CONTENTSSELECT',
          items: [data.where],
          index: 0,
        });
        break;
      case 'disLike':
        dispatch({
          type: 'CONTENTSSELECT',
          items: [data.where],
          index: 0,
        });
        break;
      case 'comment': {
        const {where} = data;
        const res = await firestore().doc(`posts/${where.itemId}`).get();
        const post = res.data();
        const artist = await post.artist.get();
        post.id = res.id;
        post.artist = artist.data();
        post.date = post.date.toDate();
        where.createdAt = where.createdAt.toDate();
        dispatch({
          type: 'PRESSNOTIFICATIONCOMMENT',
          items: [post],
          index: 0,
          pressNotification: where,
        });
        break;
      }
      case 'reply': {
        const {where} = data;
        const res = await firestore().doc(`posts/${where.itemId}`).get();
        const post = res.data();
        const artist = await post.artist.get();
        post.id = res.id;
        post.artist = artist.data();
        post.date = post.date.toDate();
        where.createdAt = where.createdAt.toDate();
        dispatch({
          type: 'PRESSNOTIFICATIONCOMMENT',
          items: [post],
          index: 0,
          pressNotification: where,
        });
        break;
      }
      case 'follow':
        dispatch({
          type: 'PRESSNOTIFICATIONFOLLOW',
          pressNotification: data.userId,
        });
        break;
      case 'sell':
        dispatch({
          type: 'PRESSNOTIFICATIONSELL',
          pressNotification: data.where,
        });
        break;
    }
  };
  const [lists, setLists] = useState();
  const [loading, setLoading] = useState();
  const ref = firestore()
    .collection('users')
    .doc(auth().currentUser.uid)
    .collection('notification')
    .orderBy('createdAt', 'desc');
  useEffect(() => {
    unsubscribe = ref.onSnapshot(
      snapshot => {
        const notifications = [];
        snapshot.forEach(async doc => {
          const data = doc.data();
          notifications.push(data);
        });
        setLists(notifications);
        console.log(notifications);
        setLoading(false);
      },
      err => {
        console.log(err);
        setLoading(false);
        Alert.alert('データの読み込みに失敗しました。');
      },
    );
    return unsubscribe;
  }, []);
  return (
    <ScrollView>
      <FlatList
        contentContainerStyle={styles.container}
        data={lists}
        renderItem={({item}) => (
          <NotificationItem item={item} handlePress={handlePress} />
        )}
        keyExtractor={item => item.id}
      />
    </ScrollView>
  );
}
function NotificationItem({item, handlePress}) {
  return (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        handlePress(item);
      }}>
      <View style={styles.header}>
        <View style={styles.itemList}>
          <Image
            source={{uri: item.notification.imageUrl}}
            style={styles.image}
          />
        </View>
        <Text style={styles.infoText}>
          {dateToString(item.createdAt.toDate())}
        </Text>
      </View>
      <Text style={styles.desccription}>{item.notification.body}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingBottom: 64,
  },
  item: {
    backgroundColor: 'white',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomColor: '#A7A7A7',
    borderBottomWidth: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    height: 24,
    fontSize: 18,
    color: 'black',
  },
  infoValue: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 16,
  },
  itemList: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoText: {
    height: 16,
    fontSize: 13,
    color: '#6B6B6B',
  },
  image: {
    borderRadius: 12,
    width: 40,
    height: 40,
    marginRight: 16,
  },
});
