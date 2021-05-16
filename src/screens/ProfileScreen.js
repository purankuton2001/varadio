/* eslint-disable no-shadow */
/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  FlatList,
  Text,
  View,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import {Overlay} from 'react-native-elements';
import ContentsList from '../components/ContentsList';
import UserPlayList from '../components/UserPlayList';
import Profile from '../components/Profile';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();

export default function ProfileScreen(props) {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState();
  const [posts, setPosts] = useState();
  const [playLists, setPlayLists] = useState();
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState([]);
  const [item, setItem] = useState();
  const check = id => {
    if (!isCheck(id)) {
      setChecked([...checked, id]);
    } else {
      setChecked([checked.filter(i => i !== id)]);
    }
  };
  const isCheck = id => {
    const isThere = checked.includes(id);
    return isThere;
  };
  const iconPress = i => {
    setItem(i);
    setVisible(!visible);
  };
  const overlayPress = () => {
    const ref = firestore()
      .collection(`users/${auth().currentUser.uid}/posts`)
      .doc(item.id);
    ref
      .set({
        playLists: checked,
        isComment: item.isComment,
        url: item.url,
        genre: item.genre,
        title: item.title,
        artwork: item.artwork,
        date: item.date,
        postRange: item.postRange,
        materialRange: item.materialRange,
        artist: firestore().collection('users').doc(item.artist.id),
        tags: item.tags,
      })
      .then(() => {
        setVisible(!visible);
        setChecked([]);
      });
  };
  function playlistfetch() {
    if (auth().currentUser) {
      const db = firestore();
      const ref = db
        .collection(`users/${auth().currentUser.uid}/playLists`)
        .orderBy('date', 'desc');
      const subscribe = ref.onSnapshot(
        snapshot => {
          const userPlayLists = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            data.artist.get().then(artist => {
              userPlayLists.push({
                id: doc.id,
                title: data.title,
                artwork: data.artwork,
                artist: artist.data(),
                description: data.description,
                date: data.date.toDate(),
                link: data.link,
                posts: data.posts,
              });
            });
          });
          setPlayLists(userPlayLists);
          setLoading(false);
        },
        () => {
          setLoading(false);
          Alert.alert('データの読み込みに失敗しました。');
        },
      );
      return subscribe;
    }
  }

  function postsfetch() {
    if (auth().currentUser) {
      const db = firestore();
      const ref = db
        .collection(`users/${auth().currentUser.uid}/posts`)
        .orderBy('date', 'desc');
      ref.get().then(
        snapshot => {
          const userposts = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            data.artist.get().then(artist => {
              console.log(userposts);
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
              });
            });
          });
          setPosts(userposts);
          setLoading(false);
        },
        () => {
          setLoading(false);
          Alert.alert('データの読み込みに失敗しました。');
        },
      );
    }
  }

  function userfetch() {
    if (auth().currentUser) {
      const db = firestore();
      const ref = db.collection('users').doc(`${auth().currentUser.uid}`);
      ref.get().then(doc => {
        const data = doc.data();
        console.log(data);
        setProfile({
          name: data.name,
          profileImage: data.profileImage,
          description: data.description,
          id: data.id,
          link: data.link,
          location: data.location,
        });
        setLoading(false);
      });
    }
  }

  useEffect(() => {
    const unsubscribe2 = playlistfetch();
    userfetch();
    postsfetch();
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (!user) {
        navigation.reset({
          index: 0,
          routes: [{name: 'NoAccount'}],
        });
      }
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Setting');
            }}>
            <Icon
              name="cog-outline"
              style={{marginRight: 20}}
              size={24}
              color="#A7A7A7"
            />
          </TouchableOpacity>
        ),
      });
    });
    return () => {
      unsubscribe2;
      unsubscribe;
    };
  }, [navigation]);
  function renderItem({item}) {
    return (
      <View style={styles.bottomBotton}>
        <CheckBox
          center
          value={item ? isCheck(item.id) : false}
          onValueChange={() => {
            item ? check(item.id) : null;
          }}
          checkedColor="#F2994A"
        />
        <Text style={styles.bottomText}>{item && item.title}</Text>
      </View>
    );
  }
  return (
    <ScrollView style={styles.container} nestedScrollEnabled={true}>
      <Profile profile={profile} />
      <Tab.Navigator
        tabBarOptions={{
          indicatorStyle: {backgroundColor: '#F2994A'},
          activeTintColor: '#F2994A',
          inactiveTintColor: '#A7A7A7',
        }}>
        <Tab.Screen
          name="投稿"
          children={() => <ContentsList items={posts} iconPress={iconPress} />}
        />
        <Tab.Screen
          name="プレイリスト"
          children={() => <UserPlayList playLists={playLists} />}
        />
      </Tab.Navigator>
      <Overlay
        overlayStyle={styles.overlay}
        isVisible={visible}
        onBackdropPress={() => {
          setVisible(false);
          setChecked(checked);
        }}
        containerStyle={{backgroundColor: 'rgba(0.5, 0.25, 0, 0.2)'}}>
        <Text style={styles.overlayTitle}>音声の保存先</Text>
        <FlatList
          data={playLists}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.flatList}
        />
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setVisible(false);
              setChecked(checked);
            }}>
            <Text style={styles.buttonText}>キャンセル</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={overlayPress}>
            <Text style={styles.buttonText}>保存</Text>
          </TouchableOpacity>
        </View>
      </Overlay>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  overlay: {
    width: '80%',
    height: '60%',
  },
  bottomBotton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    height: 56,
    alignItems: 'center',
  },
  bottomText: {
    height: 24,
    fontSize: 18,
    justifyContent: 'center',
    marginLeft: 4,
  },
  buttonText: {
    padding: 8,
    height: 48,
    fontSize: 18,
  },
  overlayTitle: {
    padding: 8,
    height: 48,
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: 'white',
  },
  button: {
    alignItems: 'flex-end',
    marginHorizontal: 32,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 16,
  },
});
