/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  FlatList,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import {Input, BottomSheet, Image, Overlay} from 'react-native-elements';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
const RNFS = require('react-native-fs');
import ImagePicker from 'react-native-image-crop-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function RecordPostScreen(props) {
  const {navigation, route} = props;
  const [loading, setLoading] = useState(false);
  const [playLists, setPlayLists] = useState([]);
  const [title, setTitle] = useState('');
  const [checked, setChecked] = useState([]);
  const [genre, setGenre] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [playlistIsVisible, setPlaylistIsVisible] = useState(false);
  const [bottom, setBottom] = useState();
  const [postRange, setPostRange] = useState(0);
  const [materialRange, setMaterialRange] = useState(0);
  const [isComment, setIsComment] = useState(false);
  const [image, setImage] = useState(
    'gs://hitokoto-309511.appspot.com/sample/image/m_e_others_500.png',
  );
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
  }, []);

  const recordPost = () => {
    const tags = genre.match(/[#＃][Ａ-Ｚａ-ｚA-Za-z一-鿆0-9０-９ぁ-ヶｦ-ﾟー]+/);
    const postIndex = Date.now().toString();
    const dlImage = image;
    const uploadRef = storage()
      .ref(`users/${auth().currentUser.uid}/records`)
      .child(`${postIndex}`);
    const imageRef = storage()
      .ref(`users/${auth().currentUser.uid}/artworks`)
      .child(`${postIndex}`);
    RNFS.readFile(route.params.filename, 'base64').then(async res => {
      await uploadRef.putString(res, 'base64').catch(() => {
        Alert.alert('画像のアップロードに失敗しました');
      });
      const localUri = await fetch(dlImage);
      localUri.blob().then(img => {
        imageRef
          .put(img)
          .then(() => {
            uploadRef.getDownloadURL().then(url => {
              imageRef
                .getDownloadURL()
                .then(artwork => {
                  const ref = firestore().collection(
                    `users/${auth().currentUser.uid}/posts`,
                  );
                  ref
                    .add({
                      url,
                      title,
                      genre,
                      artwork,
                      tags: tags ? tags : [],
                      postRange,
                      materialRange,
                      playLists: checked,
                      isComment,
                      date: new Date(),
                      artist: firestore().doc(
                        `users/${auth().currentUser.uid}`,
                      ),
                    })
                    .catch(() => {
                      Alert.alert('ファイルのアップロードに失敗しました。');
                    });
                })
                .catch(() => {
                  Alert.alert('画像のアップロードに失敗しました');
                });

              navigation.reset({
                index: 0,
                routes: [{name: 'Main'}],
              });
            });
          })
          .catch(() => {
            Alert.alert('ダウンロード用urlの取得に失敗しました。');
          });
      });
    });
  };
  function handlePress(range) {
    setBottom(range);
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
    ImagePicker.openPicker({
      cropping: true,
    }).then(img => {
      setImage(img.path);
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
          handlePress(true);
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
        }}>
        <Text style={styles.bottomText}>素材公開範囲</Text>
        <Text>
          {materialRange === 0 && '全員'}
          {materialRange === 1 && 'フォロワー'}
          {materialRange === 2 && 'リンクを知っている人のみ'}
          {materialRange === 3 && '非公開'}
        </Text>
      </TouchableOpacity>
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
            bottom ? setPostRange(0) : setMaterialRange(0);
          }}>
          <Text style={styles.bottomText}>全員に公開</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomBotton}
          onPress={() => {
            setIsVisible(false);
            bottom ? setPostRange(1) : setMaterialRange(1);
          }}>
          <Text style={styles.bottomText}>フォローワーのみ公開</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomBotton}
          onPress={() => {
            setIsVisible(false);
            bottom ? setPostRange(2) : setMaterialRange(2);
          }}>
          <Text style={styles.bottomText}>リンクを知っている人のみ公開</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomBotton}
          onPress={() => {
            setIsVisible(false);
            bottom ? setPostRange(3) : setMaterialRange(3);
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
    borderRadius: 24,
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
