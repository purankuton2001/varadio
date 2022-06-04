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
import SellsList from '../components/SellsList';
import Record from '../components/Record';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';

const Tab = createMaterialTopTabNavigator();

export default function RecordScreen(props) {
  const {route, navigation} = props;
  const {item} = route.params;
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [sells, setSells] = useState([]);

  useEffect(() => {
    if (item) {
      let unsubscribe = () => {};
      const db = firestore();
      const userposts = [];
      db.collection('records')
        .doc(item.id)
        .collection('posts')
        .get()
        .then(posts => {
          posts.forEach(post => {
            const data = post.data();
            data.artist.get().then(a => {
              const artist = a.data();
              userposts.push({
                viewedAmount: data.viewedAmount,
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
              setItems(userposts);
              setLoading(false);
            });
          });
        });
      return unsubscribe;
    }
  }, [item]);
  useEffect(() => {
    if (item) {
      let unsubscribe = () => {};
      const db = firestore();
      const userposts = [];
      unsubscribe = db
        .collection('records')
        .doc(item.id)
        .collection('sells')
        .onSnapshot(posts => {
          posts.forEach(post => {
            console.log(data);
            const data = post.data();
            data.seller.get().then(a => {
              const seller = a.data();
              userposts.push({
                record: item,
                id: post.id,
                date: data.date.toDate(),
                seller,
                amount: data.amount,
                price: data.price,
                sellId: data.sellId,
              });
              console.log(userposts);
              setSells(userposts);
              setLoading(false);
            });
          });
        });
      return unsubscribe;
    }
  }, [item]);

  return (
    <ScrollView style={styles.container}>
      <Record item={item} items={items} />
      <Tab.Navigator
        sceneContainerStyle={{flex: 1}}
        tabBarOptions={{
          indicatorStyle: {backgroundColor: '#F2994A'},
          activeTintColor: '#F2994A',
          inactiveTintColor: '#A7A7A7',
        }}>
        <Tab.Screen
          name="投稿"
          children={() => <ContentsList items={items} />}
        />
        <Tab.Screen
          name="販売"
          children={() => <SellsList record={item} items={sells} />}
        />
      </Tab.Navigator>
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
