import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import {Input, BottomSheet, Image} from 'react-native-elements';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
const RNFS = require('react-native-fs');
import ImagePicker from 'react-native-image-crop-picker';
import TagInput from 'react-native-tags-input';
import Tags from 'react-native-tags';

export default function RecordPostScreen(props) {
  const {navigation, route} = props;
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [tags, setTags] = useState({tag: '', tagsArray: []});
  const [playlistIsVisible, setPlaylistIsVisible] = useState(false);
  const [bottom, setBottom] = useState();
  const [postRange, setPostRange] = useState(0);
  const [materialRange, setMaterialRange] = useState(0);
  const [isComment, setIsComment] = useState(false);
  const [image, setImage] = useState(
    'gs://hitokoto-309511.appspot.com/sample/image/m_e_others_500.png',
  );
  const ref = firestore().collection(`users/${auth().currentUser.uid}/posts`);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.postBotton} onPress={recordPost}>
          <Text style={styles.postText}>投稿</Text>
        </TouchableOpacity>
      ),
    });
  });
  const updateState = state => {
    setTags(state);
  };
  const recordPost = () => {
    const postIndex = Date.now().toString();
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
      RNFS.readFile(image, 'base64').then(async img => {
        await imageRef.putString(img, 'base64').catch(() => {
          Alert.alert('画像のアップロードに失敗しました');
        });

        await uploadRef
          .getDownloadURL()
          .then(url => {
            imageRef.getDownloadURL().then(artwork => {
              ref.add({
                url,
                title,
                genre,
                artwork,
                postRange,
                materialRange,
                isComment,
                date: new Date(),
                artist: firestore().doc(`users/${auth().currentUser.uid}`),
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
  const playlistPress = () => {
    setPlaylistIsVisible(true);
  };
  const handleImage = () => {
    ImagePicker.openPicker({
      width: 120,
      height: 120,
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
      <View style={styles.bottomBotton}>
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
          containerStyle={styles.description}
          inputContainerStyle={styles.descriptionInner}
          inputStyle={styles.description}
          value={genre}
          onChangeText={e => {
            setGenre(e);
          }}
        />
      </View>
      <View style={styles.tagCell}>
        <Text style={styles.tagLabel}>タグ</Text>
        <Tags
          initialText=""
          textInputProps={{
            placeholder: 'Tag',
          }}
          initialTags={[]}
          onChangeTags={tags => console.log(tags)}
          onTagPress={(index, tagLabel, event, deleted) =>
            console.log(
              index,
              tagLabel,
              event,
              deleted ? 'deleted' : 'not deleted',
            )
          }
          containerStyle={{justifyContent: 'flex-start'}}
          inputStyle={{
            backgroundColor: 'white',
            height: 16,
            fontSize: 12,
            paddingBottom: 2,
          }}
          inputContainerStyle={{
            height: 16,
          }}
          renderTag={({tag, index, onPress, deleteTagOnPress, readonly}) => (
            <TouchableOpacity
              style={styles.tagContainer}
              key={`${tag}-${index}`}
              onPress={onPress}>
              <Text style={styles.tagText}>#{tag}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <TouchableOpacity
        style={styles.bottomBotton}
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
        style={styles.bottomBotton}
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
      <View style={styles.bottomBotton}>
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
      <TouchableOpacity style={styles.bottomBotton} onPress={playlistPress}>
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

      <BottomSheet
        isVisible={playlistIsVisible}
        containerStyle={{
          backgroundColor: 'rgba(0.5, 0.25, 0, 0.2)',
        }}>
        <TouchableOpacity style={styles.bottomBotton}>
          <CheckBox
            center
            value={isComment}
            onValueChange={e => {
              setIsComment(e);
            }}
            checkedColor="#F2994A"
          />
          <Text style={styles.bottomText}>いいねした動画</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomBotton}
          onPress={() => {
            setPlaylistIsVisible(false);
          }}>
          <Text style={styles.bottomText}>適用</Text>
        </TouchableOpacity>
      </BottomSheet>
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
  tagCell: {
    paddingLeft: 96,
    paddingRight: 32,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tagLabel: {
    height: 16,
    fontSize: 14,
  },
  tagContainer: {
    alignSelf: 'flex-start',
    marginHorizontal: 4,
    marginBottom: 4,
  },
  tagText: {
    height: 16,
    fontSize: 12,
    color: '#F2994A',
  },
  bottomBotton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    height: 48,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginVertical: 8,
    justifyContent: 'space-between',
  },
  descriptionContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    height: 128,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginVertical: 8,
    justifyContent: 'space-between',
  },
  descriptionInner: {
    height: 128,
  },
  decription: {
    height: 128,
    fontSize: 18,
  },
  title: {
    height: 48,
  },
  bottomText: {
    width: 80,
    height: 24,
    fontSize: 18,
    justifyContent: 'center',
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
});
