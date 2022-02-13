import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import {Input, Image} from 'react-native-elements';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
const RNFS = require('react-native-fs');
import ImagePicker from 'react-native-image-crop-picker';
import DraggableList from '../components/DraggableList';


export default function PlayListEditScreen(props) {
  const {navigation, route} = props;
  const {playlist, items} = route.params;
  const [posts, setPosts] = useState(items);
  const [name, setName] = useState(playlist.title);
  const [description, setDescription] = useState(playlist.description);
  const [link, setLink] = useState(playlist.link);
  const [image, setImage] = useState(playlist.artwork);
  const ref = firestore().doc(`users/${auth().currentUser.uid}/playLists/${playlist.id}`);

  useEffect(() => {
    console.log(posts);
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.postBotton} onPress={playlistPost}>
          <Text style={styles.postText}>保存</Text>
        </TouchableOpacity>
      ),
    });
  }, [description, name, link, image, posts]);
  const playlistPost = () => {
    if (image.indexOf('https') === -1) {
      const postIndex = Date.now().toString();
      const imageRef = storage()
        .ref(`users/${auth().currentUser.uid}/artwork`)
        .child(`${postIndex}`);
      RNFS.readFile(image, 'base64').then(async img => {
        await imageRef.putString(img, 'base64').catch(() => {
          Alert.alert('画像のアップロードに失敗しました');
        });
        const artwork = await imageRef.getDownloadURL();
        setImage(artwork);
      });
    }
    console.log(image);
    let newItems = [];
    for (let i = 0; i < posts.length; i++) {
      newItems.push(posts[i].id);
      if (i == posts.length - 1) {
        console.log(description);
        ref.update({
          description,
          title:name,
          artwork: image,
          link,
          posts: newItems,
        })
        .then(() => {
          navigation.reset({
            index: 0,
            routes: [{name: 'Main'}],
          });
        });
      }
    }
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
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <TouchableOpacity onPress={handleImage} style={styles.imageContainer}>
          <Image source={{uri: image}} style={styles.image} />
        </TouchableOpacity>
        <View style={styles.bottomBotton}>
          <Text style={styles.bottomText}>名前</Text>
          <Input
            style={styles.fontSize}
            placeholder="Name"
            containerStyle={styles.title}
            value={name}
            onChangeText={e => {
              setName(e);
            }}
          />
        </View>
        <View style={styles.descriptionContainer}>
          <Text style={styles.bottomText}>説明</Text>
          <Input
            style={styles.fontSize}
            placeholder="Description"
            multiline
            containerStyle={styles.description}
            inputContainerStyle={styles.descriptionInner}
            inputStyle={styles.descriptionInput}
            value={description}
            onChangeText={e => {
              setDescription(e);
            }}
          />
        </View>
        <View style={styles.bottomBotton}>
          <Text style={styles.bottomText}>リンク</Text>
          <Input
            style={styles.fontSize}
            placeholder="link"
            containerStyle={styles.title}
            value={link}
            onChangeText={e => {
              setLink(e);
            }}
          />
        </View>
      </View>
      <DraggableList
        pressTrash={id => {
          setPosts(posts.filter(post => post.id != id))
        }}
        items={posts}
        dragEnd={({data}) => {
          if(data){
            setPosts(data);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  infoContainer:{
    paddingBottom : 16,
    backgroundColor:'white',
    elevation: 2,
    shadowColor: 'black',
    shadowOffset: {height: 1},
    shadowOpacity: 0.3,
  },
  image: {
    width: 88,
    height: 88,
  },
  imageContainer: {
    width: 88,
    height: 88,
    alignSelf: 'center',
    marginVertical: 16,
    overflow: 'hidden',
    borderRadius: 44,
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
    height: 96,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  description: {
    paddingRight:80,
  },
  descriptionInput: {
    height: 96,
    top:0,
  },
  descriptionInner: {
    top:0,
    height: 96,
  },
  fontSize: {
    fontSize: 13,
  },
  title: {
    paddingRight:80,
    height: 48,
  },
  bottomText: {
    width: 80,
    height: 16,
    fontSize: 13,
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
