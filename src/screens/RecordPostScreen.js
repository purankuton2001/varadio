/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect, useContext} from 'react';
import {
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  FlatList,
} from 'react-native';
import {EditorContext} from '../../App';
import CheckBox from '@react-native-community/checkbox';
import {Input, BottomSheet, Image, Overlay} from 'react-native-elements';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
const RNFS = require('react-native-fs');

export default function RecordPostScreen(props) {
  const {navigation} = props;
  const [loading, setLoading] = useState(false);
  const [playLists, setPlayLists] = useState([]);
  const [title, setTitle] = useState('');
  const [checked, setChecked] = useState([]);
  const [genre, setGenre] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [playlistIsVisible, setPlaylistIsVisible] = useState(false);
  const [postRange, setPostRange] = useState(0);
  const [isComment, setIsComment] = useState(false);
  const {editorState, editorDispatch} = useContext(EditorContext);
  const [image, setImage] = useState(
    'gs://hitokoto-309511.appspot.com/sample/image/m_e_others_500.png',
  );
  const postRef = firestore().collection(
    `users/${auth().currentUser.uid}/posts`,
  );
  const playListRef = firestore()
    .collection(`users/${auth().currentUser.uid}/playLists`)
    .orderBy('date', 'desc');

  function playlistfetch() {
    if (auth().currentUser) {
      playListRef.get().then(
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
              });
            });
          });
          setPlayLists(userPlayLists);
          setLoading(false);
        },
        () => {
          setLoading(false);
          Alert.alert('?????????????????????????????????????????????');
        },
      );
    }
  }

  useEffect(() => {
    playlistfetch();
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.postBotton} onPress={recordPost}>
          <Text style={styles.postText}>??????</Text>
        </TouchableOpacity>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, genre, title]);
  const recordPost = () => {
    const tags = genre.match(/[#???][???-??????-???A-Za-z???-???0-9???-??????-??????-??????]+/);
    const postIndex = Date.now().toString();
    const imageRef = storage()
      .ref(`users/${auth().currentUser.uid}/posts`)
      .child(`${postIndex}`);
    RNFS.readFile(image.uri, 'base64').then(async img => {
      imageRef
        .putString(img, 'base64')
        .then(() => {
          imageRef
            .getDownloadURL()
            .then(artwork => {
              postRef
                .add({
                  duration: editorState.duration,
                  records: editorState.records,
                  title,
                  genre,
                  artwork,
                  tags: tags ? tags : [],
                  postRange,
                  playLists: checked,
                  isComment,
                  date: new Date(),
                  artist: firestore().doc(`users/${auth().currentUser.uid}`),
                })
                .then(() => {
                  navigation.reset({
                    index: 0,
                    routes: [{name: 'Main'}],
                  });
                })
                .catch(() => {
                  Alert.alert('??????????????????????????????');
                });
            })
            .catch(() => {
              Alert.alert('??????url??????????????????????????????');
            });
        })
        .catch(() => {
          Alert.alert('????????????????????????????????????????????????');
        });
    });
  };
  function handlePress() {
    setIsVisible(true);
  }
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

  const playlistPress = () => {
    setPlaylistIsVisible(true);
  };

  const handleImage = () => {
    let options = {
      title: '???????????????',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    let ImagePicker = require('react-native-image-picker');
    ImagePicker.launchImageLibrary(options, async response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        setImage(response);
        console.log(response);
      }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={handleImage} style={styles.imageContainer}>
        <Image source={{uri: image.uri}} style={styles.image} />
      </TouchableOpacity>
      <View style={styles.Cell}>
        <Text style={styles.bottomText}>????????????</Text>
        <Input
          placeholder="Title"
          containerStyle={styles.title}
          value={title}
          onChangeText={e => {
            setTitle(e);
          }}
        />
      </View>
      <View style={styles.descriptionContainer}>
        <Text style={styles.bottomText}>??????</Text>
        <Input
          placeholder="Description"
          multiline
          inputContainerStyle={styles.descriptionInner}
          inputStyle={styles.description}
          value={genre}
          onChangeText={e => {
            setGenre(e);
          }}
        />
      </View>
      <TouchableOpacity
        style={styles.tag}
        onPress={() => {
          setGenre(genre + '#');
        }}>
        <Icon name="pound" size={16} color="#F2994A" />
        <Text style={styles.tagText}>???????????????</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.Cell}
        onPress={() => {
          setIsVisible(true);
        }}>
        <Text style={styles.bottomText}>????????????</Text>
        <Text>
          {postRange === 0 && '??????'}
          {postRange === 1 && '???????????????'}
          {postRange === 2 && '????????????????????????????????????'}
          {postRange === 3 && '?????????'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.Cell}
        onPress={() => {
          handlePress(false);
        }}
      />
      <View style={styles.Cell}>
        <Text style={styles.bottomText}>??????????????????????????????</Text>
        <CheckBox
          center
          value={isComment}
          onValueChange={e => {
            setIsComment(e);
          }}
          checkedColor="#F2994A"
        />
      </View>
      <TouchableOpacity style={styles.Cell} onPress={playlistPress}>
        <Text style={styles.bottomText}>???????????????????????????</Text>
      </TouchableOpacity>
      <BottomSheet
        isVisible={isVisible}
        containerStyle={{
          backgroundColor: 'rgba(0.5, 0.25, 0, 0.2)',
        }}>
        <TouchableOpacity
          style={styles.bottomBotton}
          onPress={() => {
            setIsVisible(false);
            setPostRange(0);
          }}>
          <Text style={styles.bottomText}>???????????????</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomBotton}
          onPress={() => {
            setIsVisible(false);
            setPostRange(1);
          }}>
          <Text style={styles.bottomText}>??????????????????????????????</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomBotton}
          onPress={() => {
            setIsVisible(false);
            setPostRange(2);
          }}>
          <Text style={styles.bottomText}>??????????????????????????????????????????</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomBotton}
          onPress={() => {
            setIsVisible(false);
            setPostRange(3);
          }}>
          <Text style={styles.bottomText}>?????????</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomBotton}
          onPress={() => {
            setIsVisible(false);
          }}>
          <Text style={styles.bottomText}>???????????????</Text>
        </TouchableOpacity>
      </BottomSheet>
      <Overlay
        overlayStyle={styles.overlay}
        isVisible={playlistIsVisible}
        onBackdropPress={() => {
          setPlaylistIsVisible(false);
          setChecked(checked);
        }}
        containerStyle={{backgroundColor: 'rgba(0.5, 0.25, 0, 0.2)'}}>
        <Text style={styles.overlayTitle}>??????????????????</Text>
        <FlatList
          data={playLists}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setPlaylistIsVisible(false);
              setChecked(checked);
            }}>
            <Text style={styles.buttonText}>???????????????</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setPlaylistIsVisible(false);
            }}>
            <Text style={styles.buttonText}>??????</Text>
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
  image: {
    width: 120,
    height: 120,
  },
  imageContainer: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginVertical: 32,
    overflow: 'hidden',
    borderRadius: 60,
  },
  tag: {
    height: 24,
    paddingHorizontal: 12,
    alignItems: 'center',
    left: 96,
    flexDirection: 'row',
  },
  tagText: {
    marginBottom: 4,
    height: 16,
    fontSize: 14,
    color: '#F2994A',
  },
  overlay: {
    width: '80%',
    height: '60%',
  },
  overlayTitle: {
    padding: 8,
    height: 48,
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: 'white',
  },
  bottomBotton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    height: 48,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  Cell: {
    flexDirection: 'row',
    backgroundColor: 'white',
    height: 48,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginVertical: 8,
    justifyContent: 'space-between',
  },
  descriptionContainer: {
    position: 'relative',
    flexDirection: 'row',
    backgroundColor: 'white',
    height: 144,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginVertical: 8,
    justifyContent: 'space-between',
  },
  descriptionInner: {
    height: 144,
    marginRight: 72,
  },
  decription: {
    height: 144,
    fontSize: 18,
  },
  title: {
    height: 48,
    paddingRight: 80,
  },
  buttonText: {
    padding: 8,
    height: 48,
    fontSize: 18,
  },
  bottomText: {
    minWidth: 80,
    height: 24,
    fontSize: 18,
    marginLeft: 4,
    justifyContent: 'center',
  },
  button: {
    alignItems: 'flex-end',
    marginHorizontal: 32,
  },
  postText: {
    height: 24,
    fontSize: 18,
    justifyContent: 'center',
    color: '#F2994A',
  },
  postBotton: {
    marginRight: 12,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 16,
  },
});
