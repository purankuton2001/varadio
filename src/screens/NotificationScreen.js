import React, {useEffect} from 'react';
import MessageList from '../components/MessageList';
import NotificationList from '../components/NotificationList';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import firebase from '@react-native-firebase/app';

const Tab = createMaterialTopTabNavigator();

export default function NotificationScreen(props) {
  const {navigation} = props;
  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        navigation.reset({
          index: 0,
          routes: [{name: 'NoAccount'}],
        });
      }
    });
    return unsubscribe;
  });
  return (
    <Tab.Navigator
      tabBarOptions={{
        indicatorStyle: {backgroundColor: '#F2994A'},
        activeTintColor: '#F2994A',
        inactiveTintColor: '#A7A7A7',
      }}>
      <Tab.Screen name="Notification" component={NotificationList} />
      <Tab.Screen name="Message" component={MessageList} />
    </Tab.Navigator>
  );
}
