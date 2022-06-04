import React from 'react';
import NoAccountScreen from './NoAccountScreen';
import NotificationScreen from './NotificationScreen';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import ProfileScreen from './ProfileScreen';
import FollowScreen from './FollowScreen';
import RecordScreen from './RecordScreen';


const Stack = createStackNavigator();

export default function NotificationStackScreen(props) {
  return (
    <Stack.Navigator
      screenOptions={{
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}>
      <Stack.Screen name="Notification" component={NotificationScreen} />
      <Stack.Screen
      name="profile"
      component={ProfileScreen}
      initialParams={{ id: null }}
      getId={({ params }) => params.id}
      />
      <Stack.Screen
        name="NoAccount"
        component={NoAccountScreen}
        options={{
          cardStyleInterpolator:
            CardStyleInterpolators.forScaleFromCenterAndroid,
        }}
      />
      <Stack.Screen name="Follow" component={FollowScreen} getId={({ params }) => params.id} />
      <Stack.Screen name="Record" component={RecordScreen} />
    </Stack.Navigator>
  );
}
