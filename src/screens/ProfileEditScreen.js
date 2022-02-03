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

export default function RecordPostScreen(props) {
  const {navigation, route} = props;
  const {profile} = route.params;
  const [name, setName] = useState(profile.name);
  const [description, setDescription] = useState(profile.description);
  const [location, setLocation] = useState(profile.location);
  const [link, setLink] = useState(profile.link);
  const [image, setImage] = useState(profile.profileImage);
  const ref = firestore().doc(`users/${auth().currentUser.uid}`);

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
    if (image.indexOf('https') === -1) {
      const postIndex = Date.now().toString();
      const imageRef = storage()
        .ref(`users/${auth().currentUser.uid}/profileImage`)
        .child(`${postIndex}`);
      RNFS.readFile(image, 'base64').then(async img => {
        await imageRef.putString(img, 'base64').catch(() => {
          Alert.alert('画像のアップロードに失敗しました');
        });
        const profileImage = await imageRef.getDownloadURL();
        setImage(profileImage);
      });
    }
    ref.set({
      description,
      name,
      profileImage: image,
      link,
      location,
      id: profile.id,
    });
    navigation.reset({
      index: 0,
      routes: [{name: 'Main'}],
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
      <View style={styles.bottomBotton}>
        <Text style={styles.bottomText}>名前</Text>
        <Input
          placeholder="Name"
          containerStyle={styles.title}
          value={name}
          onChangeText={e => {
            setName(e);
          }}
        />
      </View>
      <View style={styles.descriptionContainer}>
        <Text style={styles.bottomText}>自己紹介</Text>
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
      <View style={styles.bottomBotton}>
        <Text style={styles.bottomText}>居住地</Text>
        <Input
          placeholder="Location"
          containerStyle={styles.title}
          value={location}
          onChangeText={e => {
            setLocation(e);
          }}
        />
      </View>
      <View style={styles.bottomBotton}>
        <Text style={styles.bottomText}>リンク</Text>
        <Input
          placeholder="link"
          containerStyle={styles.title}
          value={link}
          onChangeText={e => {
            setLink(e);
          }}
        />
      </View>
      <View style={styles.bottomBotton}>
        <Text style={styles.bottomText}>誕生日</Text>
        <Input
          placeholder="Birthday"
          containerStyle={styles.title}
          value={name}
          onChangeText={e => {
            setName(e);
          }}
        />
      </View>
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
