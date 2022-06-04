import React, {useEffect} from 'react';
import {StyleSheet, View, Text, Image, TouchableOpacity, FlatList} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

export default function FollowList({items}) {
  return (
    <View style={styles.container}>
    <FlatList
      data={items}
      renderItem={({item}) => <UserItem item={item} />}
      keyExtractor={item => item.id}
    />
  </View>
  )
}
function UserItem({item}){
  const navigation = useNavigation();
  const [follow, setFollow] = React.useState(null);
  const [follower, setFollower] = React.useState(null);

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
    if (auth().currentUser) {
      const followRef = firestore()
        .collection(`users/${auth().currentUser.uid}/follows`)
        .doc(item.id);
      followRef.get().then(foll => {
        foll.exists ? setFollow(true) : setFollow(false);
      });
    }
  }, []);
  useEffect(() => {
    if (auth().currentUser) {
      const followerRef = firestore()
        .collection(`users/${auth().currentUser.uid}/followers`)
        .doc(item.id);
      followerRef?.get().then(followers => {
        followers.exists ? setFollower(true) : setFollower(false);
      });
    }
  }, []);

  useEffect(() => {
    if (auth().currentUser && follow !== null) {
      const followRef = firestore()
        .collection(`users/${auth().currentUser.uid}/follows`)
        .doc(item.id);
      switch (follow) {
        case false:
          followRef.delete();
          break;
        case true:
          followRef.set(item);
          break;
      }
    }
  }, [follow]);
  return (
    <TouchableOpacity style={styles.container} onPress={() => {navigation.navigate('profile',{id: item.id})}}>
      <View style={styles.item}>
        <Image
          source={{uri: item?.profileImage}}
          style={styles.image}
        />
        <View style={styles.information}>
          <View style={styles.header}>
            <View>
              <Text style={styles.username}>{item?.name}</Text>
            </View>
            {(auth().currentUser?.uid != item.id) &&
            (<TouchableOpacity
              style={[styles.button,
              {backgroundColor: follow ? 'white':'#F2994A'}]}
              onPress={followPress}>
              <Text style={[styles.buttonText,{color: follow ? 'black':'white'}]}>{followText()}</Text>
            </TouchableOpacity>)}
          </View>
          <Text style={styles.id}>@{item?.id}</Text>
          <Text style={styles.textContainer}>
            <Text style={styles.description}>
              {item?.description}
            </Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  id: {
    height: 16,
    color: '#A7A7A7',
    fontSize: 14,
    marginBottom: 8,
  },
  item: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomColor: '#A7A7A7',
    borderBottomWidth: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  username: {
    height: 24,
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
  },
  textContainer: {
    width: 200,
    height: 48,
  },
  description: {
    marginVertical: 8,
    height: 24,
    fontSize: 14,
    color: '#6B6B6B',
  },
  image: {
    marginRight: 8,
    borderRadius: 28,
    width: 56,
    height: 56,
    alignSelf: 'center',
  },
  information: {
    flex: 1,
  },
  button: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#F2994A',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  buttonText: {
    fontSize: 12,
    height: 16,
    color: '#F2994A',
  },
});
