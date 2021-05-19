import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import {Input, Image, BottomSheet} from 'react-native-elements';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
const RNFS = require('react-native-fs');
import ImagePicker from 'react-native-image-crop-picker';

export default function PlayListCreateScreen(props) {
  const {navigation} = props;
  const [title, setTitle] = useState('');
  const [postRange, setPostRange] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [image, setImage] = useState(
    'gs://hitokoto-309511.appspot.com/sample/image/m_e_others_500.png',
  );
  const ref = firestore().collection(
    `users/${auth().currentUser.uid}/playLists`,
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.postBotton} onPress={recordPost}>
          <Text style={styles.postText}>保存</Text>
        </TouchableOpacity>
      ),
    });
  });
  const recordPost = () => {
    const postIndex = Date.now().toString();
    const imageRef = storage()
      .ref(`users/${auth().currentUser.uid}/playListsImage`)
      .child(`${postIndex}`);
    RNFS.readFile(image, 'base64').then(async img => {
      imageRef.putString(img, 'base64').then(() => {
        imageRef.getDownloadURL().then(artwork => {
          ref.add({
            description,
            title,
            artwork,
            posts: [],
            link,
            date: new Date(),
            postRange,
            artist: firestore().doc(`users/${auth().currentUser.uid}`),
          });
          navigation.reset({
            index: 0,
            routes: [{name: 'Main'}],
          });
        });
      });
    });
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
      <View style={styles.cell}>
        <Text style={styles.cellText}>タイトル</Text>
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
        <Text style={styles.cellText}>説明</Text>
        <Input
          placeholder="Description"
          multiline
          containerStyle={styles.description}
          inputContainerStyle={styles.descriptionInner}
          inputStyle={styles.description}
          value={description}
          onChangeText={e => {
            setDescription(e);
          }}
        />
      </View>
      <View style={styles.cell}>
        <Text style={styles.cellText}>リンク</Text>
        <Input
          placeholder="link"
          containerStyle={styles.title}
          value={link}
          onChangeText={e => {
            setLink(e);
          }}
        />
      </View>
      <TouchableOpacity
        style={styles.cell}
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
  cell: {
    flexDirection: 'row',
    backgroundColor: 'white',
    height: 48,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginVertical: 8,
    justifyContent: 'space-between',
  },
  bottomBotton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    height: 48,
    paddingHorizontal: 12,
    alignItems: 'center',
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
  cellText: {
    width: 80,
    height: 24,
    fontSize: 18,
    justifyContent: 'center',
  },
  bottomText: {
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