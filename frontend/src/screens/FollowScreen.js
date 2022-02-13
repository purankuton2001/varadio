/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {StyleSheet, ScrollView, Alert, TouchableOpacity} from 'react-native';
import FollowList from '../components/FollowList';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();

export default function FollowScreen({route}) {
  const {follower, id} = route.params;
  const [loading, setLoading] = useState(false);
  const [follows, setFollows] = useState();
  const [followers, setFollowers] = useState();

  function followsfetch() {
    let unsubscribe1 = () => {};
    if (auth().currentUser) {
      const db = firestore();
      const followRef = db
      .collection(`users/${id}/follows`);
      unsubscribe1 = followRef.onSnapshot(
        snapshot => {
          const userfollows = [];
          snapshot.forEach(doc => {
            const data = doc.data();
              userfollows.push(data);
              setFollows(userfollows);
              setLoading(false);
          });
        },
        err => {
          console.log(err);
          setLoading(false);
          Alert.alert('データの読み込みに失敗しました。');
        },
      );
      return unsubscribe1;
    }
  };
  function followersfetch() {
    let unsubscribe2 = () => {};
    if (auth().currentUser) {
      const db = firestore();
      const followRef = db
      .collection(`users/${id}/followers`);
      unsubscribe2 = followRef.onSnapshot(
        snapshot => {
          const userfollowers = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            userfollowers.push(data);
            setFollowers(userfollowers);
            setLoading(false);
          });
        },
        err => {
          console.log(err);
          setLoading(false);
          Alert.alert('データの読み込みに失敗しました。');
        },
      );
      return unsubscribe2;
    }
  };
  useEffect(() => {
    const unsubscribe1 = followsfetch();
    const unsubscribe2 = followersfetch();
    return() => {
      unsubscribe1();
      unsubscribe2();
    }
  }, []);

  return (
      <Tab.Navigator
        sceneContainerStyle={{flex: 1}}
        initialRouteName={follower?"フォロワー":"フォロー"}
        tabBarOptions={{
          indicatorStyle: {backgroundColor: '#F2994A'},
          activeTintColor: '#F2994A',
          inactiveTintColor: '#A7A7A7',
        }}>
        <Tab.Screen
          name="フォロー"
          children={() => <FollowList items={follows} />}
        />
        <Tab.Screen
          name="フォロワー"
          children={() => <FollowList items={followers} />}
        />
      </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
