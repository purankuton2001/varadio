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
const RNFS = require('react-native-fs');
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function RecordAddScreen(props) {
  const {navigation, route} = props;
  const {output, start, end} = route.params;
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [playLists, setPlayLists] = useState([]);
  const [title, setTitle] = useState('');
  const [checked, setChecked] = useState([]);
  const [genre, setGenre] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isComment, setIsComment] = useState(false);
  const [playlistIsVisible, setPlaylistIsVisible] = useState(false);
  const [postRange, setPostRange] = useState(0);
  const {editorState, editorDispatch} = useContext(EditorContext);
  const [image, setImage] = useState(
    'gs://hitokoto-309511.appspot.com/sample/image/m_e_others_500.png',
  );
  const postRef = firestore().collection(
    `users/${auth().currentUser.uid}/records`,
  );
  const postIndex = Date.now().toString();
  const recordRef = storage()
    .ref(`users/${auth().currentUser.uid}/records`)
    .child(`${postIndex}`);
  const imageRef = storage()
    .ref(`users/${auth().currentUser.uid}/records`)
    .child(`${postIndex}_artwork`);

  function playlistfetch() {
    if (auth().currentUser) {
      const db = firestore();
      const ref = db
        .collection(`users/${auth().currentUser.uid}/playLists`)
        .orderBy('date', 'desc');
      ref.get().then(
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
          Alert.alert('メモの読み込みに失敗しました。');
        },
      );
    }
  }

  useEffect(() => {
    playlistfetch();
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.postBotton} onPress={recordPost}>
          <Text style={styles.postText}>投稿</Text>
        </TouchableOpacity>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, genre, title]);
  const recordPost = () => {
    const tags = genre.match(/[#＃][Ａ-Ｚａ-ｚA-Za-z一-鿆0-9０-９ぁ-ヶｦ-ﾟー]+/);
    if (!uploading) {
      setUploading(true);
      RNFS.readFile(image, 'base64').then(async img => {
        imageRef
          .putString(img, 'base64')
          .then(() => {
            imageRef
              .getDownloadURL()
              .then(artwork => {
                RNFS.readFile(output, 'base64')
                  .then(res => {
                    recordRef
                      .putString(res, 'base64')
                      .then(() => {
                        recordRef
                          .getDownloadURL()
                          .then(url => {
                            postRef
                              .add({
                                url,
                                title,
                                genre,
                                artwork,
                                isComment,
                                tags: tags ? tags : [],
                                postRange,
                                playLists: checked,
                                date: new Date(),
                                artist: firestore().doc(
                                  `users/${auth().currentUser.uid}`,
                                ),
                              })
                              .then(docRef => {
                                const id = editorState.records.length;
                                editorDispatch({
                                  type: 'RECORDSADD',
                                  records: {
                                    id,
                                    recordId: docRef.id,
                                    title,
                                    artwork,
                                    url,
                                    rate: 1,
                                    trimStart: start,
                                    trimEnd: end,
                                    start: 0,
                                    end: end - start,
                                    volume: 100,
                                    artist: auth().currentUser.uid,
                                    storageId: postIndex,
                                  },
                                });
                                setUploading(false);
                                navigation.reset({
                                  index: 1,
                                  routes: [
                                    {name: 'Main'},
                                    {name: 'RecordEdit'},
                                  ],
                                });
                              })
                              .catch(() => {
                                Alert.alert('投稿に失敗しました。');
                              });
                          })
                          .catch(() => {
                            Alert.alert(
                              'オーディオファイルurl取得に失敗しました。',
                            );
                          });
                      })
                      .catch(() => {
                        Alert.alert(
                          'オーディオファイルのアップロードに失敗しました。',
                        );
                      });
                  })
                  .catch(() => {
                    Alert.alert('オーディオファイルが読み込めません');
                  });
              })
              .catch(() => {
                Alert.alert('画像url取得に失敗しました。');
              });
          })
          .catch(() => {
            Alert.alert('画像のアップロードに失敗しました。');
          });
      });
    }
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
    const ImagePicker = require('react-native-image-picker');

    const options = {
      title: '画像を選択',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    ImagePicker.launchImageLibrary(options, async response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        setImage(response.uri);
        console.log(image);
      }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={handleImage} style={styles.imageContainer}>
        <Image source={{uri: image}} style={styles.image} />
      </TouchableOpacity>
      <View style={styles.Cell}>
        <Text style={styles.bottomText}>タイトル</Text>
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
        <Text style={styles.bottomText}>説明</Text>
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
        <Text style={styles.tagText}>タグを追加</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.Cell}
        onPress={() => {
          setIsVisible(true);
        }}>
        <Text style={styles.bottomText}>公開範囲</Text>
        <Text>
          {postRange === 0 && '全員'}
          {postRange === 1 && 'フォロワー'}
          {postRange === 2 && 'リンクを知っている人のみ'}
          {postRange === 3 && '非公開'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.Cell}
        onPress={() => {
          handlePress(false);
        }}
      />
      <View style={styles.Cell}>
        <Text style={styles.bottomText}>コメントをオンにする</Text>
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
        <Text style={styles.bottomText}>プレイリストに追加</Text>
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
          <Text style={styles.bottomText}>全員に公開</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomBotton}
          onPress={() => {
            setIsVisible(false);
            setPostRange(1);
          }}>
          <Text style={styles.bottomText}>フォローワーのみ公開</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomBotton}
          onPress={() => {
            setIsVisible(false);
            setPostRange(2);
          }}>
          <Text style={styles.bottomText}>リンクを知っている人のみ公開</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomBotton}
          onPress={() => {
            setIsVisible(false);
            setPostRange(3);
          }}>
          <Text style={styles.bottomText}>非公開</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomBotton}
          onPress={() => {
            setIsVisible(false);
          }}>
          <Text style={styles.bottomText}>キャンセル</Text>
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
        <Text style={styles.overlayTitle}>音声の保存先</Text>
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
            <Text style={styles.buttonText}>キャンセル</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setPlaylistIsVisible(false);
            }}>
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
