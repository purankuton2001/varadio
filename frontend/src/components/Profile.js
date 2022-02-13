import React, {useState, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth'
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  Linking,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Profile(props) {
  const {profile, id} = props;
  const [follow, setFollow] = useState(null);
  const [followValue, setFollowValue] = useState(0);
  const [follower, setFollower] = useState(null);
  const [followerValue, setFollowerValue] = useState(0);
  const navigation = useNavigation();
  const handlePress = () => {
    navigation.navigate('ProfileEdit', {profile});
  };
  const followPress = () => {
    setFollow(!follow);
  }

  function followText(){
    if(follow && follower){
      return "相互フォロー"
    }
    else{
      if(follow){
        return "フォロー中"
      }
      else{
        if(follower){
          return "フォロー返し"
        }
        else{
          return "フォロー"
        }
      }
    }
  }
  useEffect(() => {
    const unsubscribe =firestore()
    .collection(`users/${profile?.id}/follows`)
    .onSnapshot((follows) => {
      setFollowValue(follows.size);
    });
    return unsubscribe
}, [profile]);
  useEffect(() => {
    const unsubscribe =firestore()
    .collection(`users/${profile?.id}/followers`)
    .onSnapshot((followers) => {
      setFollowerValue(followers.size);
    });
    return unsubscribe
}, [profile]);
  useEffect(() => {
    if (auth().currentUser) {
      const followRef = firestore()
        .collection(`users/${auth().currentUser.uid}/follows`)
        .doc(id);
      followRef.get().then(follows => {
        follows._exists ? setFollow(true) : setFollow(false);
      });
    }
  }, []);
  useEffect(() => {
    if (auth().currentUser) {
      const followerRef = firestore()
        .collection(`users/${auth().currentUser.uid}/followers`)
        .doc(id);
      followerRef.get().then(followers => {
        followers._exists ? setFollower(true) : setFollower(false);
      });
    }
  }, []);

  useEffect(() => {
    if (auth().currentUser && profile && follow !== null) {
      const followRef = firestore()
        .collection(`users/${auth().currentUser.uid}/follows`)
        .doc(id);
      switch (follow) {
        case false:
          followRef.delete();
          break;
        case true:
          followRef.set(profile);
          break;
      }
    }
  }, [profile, follow]);

  function openUrl(url) {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert(
          'エラー',
          'このページを開ませんでした',
          [{text: 'OK', onPress: () => console.log('OK Pressed')}],
          {cancelable: false},
        );
      }
    });
  }
  return (
    <View style={styles.container}>
      <Image
        source={{uri: profile && profile.profileImage}}
        style={styles.image}
      />
      <Text style={styles.username}>{profile && profile.name}</Text>
      <Text style={styles.id}>@{profile && profile.id}</Text>
      {(!id || id == auth().currentUser.uid)
      ?(
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>{"編集"}</Text>
      </TouchableOpacity>)
      :(
        <TouchableOpacity
        style={[styles.button,
        {backgroundColor: follow ? 'white':'#F2994A'}]}
        onPress={followPress}>
        <Text style={[styles.buttonText,{color: follow ? 'black':'white'}]}>{followText()}</Text>
      </TouchableOpacity>
      )}
      <View style={styles.follow}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Follow', {id: profile.id});
          }}>
          <Text style={styles.followText}>フォロー {followValue}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Follow', {id: profile.id, follower:true});
          }}>
          <Text style={styles.followText}>フォロワー {followerValue}</Text>
        </TouchableOpacity>
      </View>
        <View style={styles.description}>
          <Text>
            <Text style={styles.descriptionText}>
              {profile?.description}
            </Text>
          </Text>
        </View>
      {profile?.link ? (
        <View style={styles.link}>
          <Icon name="link-variant" size={13} />
          <TouchableOpacity
            onPress={() => {
              openUrl(profile.link);
            }}>
            <Text
              style={[styles.description, styles.linkText]}
              numberOfLines={1}>
              {profile && profile.link}
            </Text>
          </TouchableOpacity>
        </View>
      ):null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 24,
    alignItems: 'center',
  },
  image: {
    width: 96,
    height: 96,
    marginBottom: 8,
    borderRadius: 48,
  },
  username: {
    marginVertical: 8,
    height: 24,
    fontSize: 20,
    fontWeight: 'bold',
  },
  id: {
    height: 16,
    color: '#A7A7A7',
    fontSize: 14,
  },
  button: {
    marginVertical: 24,
    paddingVertical: 4,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: '#F2994A',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  buttonText: {
    fontSize: 18,
    height: 24,
    color: '#F2994A',
  },
  follow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 24,
  },
  followText: {
    marginHorizontal: 24,
    fontWeight: 'bold',
    height: 20,
    fontSize: 16,
  },
  description: {
    marginTop: 16,
    width: '80%',
    alignItems: 'center',
  },
  descriptionText: {
    height: 16,
    fontSize: 14,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    color: '#147EDF',
    textDecorationLine: 'underline',
    width: '100%',
    marginBottom: 16,
  },
});
