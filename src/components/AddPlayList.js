import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';

import CheckBox from '@react-native-community/checkbox';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {Overlay} from 'react-native-elements';

export default function AddPlayList(props) {
  const [loading, setLoading] = useState(false);
  const {item, visible, changeVisible} = props;
  const [playLists, setPlayLists] = useState();
  const [checked, setChecked] = useState([]);
  const check = id => {
    if (!isCheck(id)) {
      setChecked([...checked, id]);
    } else {
      setChecked(checked.filter(i => i !== id));
    }
  };
  const isCheck = id => {
    const isThere = checked.includes(id);
    return isThere;
  };

  useEffect(() => {
    let unsubscribe = () => {};
    if (auth().currentUser) {
      const db = firestore();
      const ref = db
        .collection(`users/${auth().currentUser.uid}/playLists`)
        .orderBy('date', 'desc');
      unsubscribe = ref.onSnapshot(
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
    }
    return unsubscribe;
  }, []);

  function renderPlaylists({item}) {
    return (
      <View style={styles.bottomBotton}>
        <CheckBox
          center
          value={item ? isCheck(item.id) : false}
          onValueChange={() => {
            console.log(checked);
            item ? check(item.id) : null;
          }}
          checkedColor="#F2994A"
        />
        <Text style={styles.bottomText}>{item && item.title}</Text>
      </View>
    );
  }

  const overlayPress = () => {
    const ref = firestore()
      .collection(`users/${auth().currentUser.uid}/posts`)
      .doc(item.id);
    console.log(item);
    ref
      .set({
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
        records: item.records,
        playLists: [...item.playLists, ...checked],
      })
      .then(() => {
        changeVisible(!visible);
        setChecked([]);
      });
  };

  return (
    <Overlay
      overlayStyle={styles.overlay}
      isVisible={visible}
      onBackdropPress={() => {
        changeVisible(false);
        setChecked(checked);
      }}
      containerStyle={{backgroundColor: 'rgba(0.5, 0.25, 0, 0.2)'}}>
      <Text style={styles.overlayTitle}>音声の保存先</Text>
      <FlatList
        data={playLists}
        renderItem={renderPlaylists}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.flatList}
      />
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            changeVisible(false);
            setChecked(checked);
          }}>
          <Text style={styles.buttonText}>キャンセル</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={overlayPress}>
          <Text style={styles.buttonText}>保存</Text>
        </TouchableOpacity>
      </View>
    </Overlay>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    position: 'relative',
    paddingBottom: 80,
  },
  item: {
    borderRadius: 40,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: 'black',
    shadowOffset: {height: 1},
    shadowOpacity: 0.3,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  image: {
    borderRadius: 36,
    width: 72,
    height: 72,
    marginRight: 16,
  },
  description: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    height: 24,
    color: 'black',
    marginBottom: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    height: 16,
  },
  infoText: {
    color: 'black',
    fontSize: 13,
    height: 16,
    marginRight: 8,
  },
  infoValue: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 16,
  },
  icon: {
    position: 'absolute',
    right: 8,
    top: 8,
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
