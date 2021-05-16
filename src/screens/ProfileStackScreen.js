import React from 'react';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import FollowScreen from './FollowScreen';
import ProfileScreen from './ProfileScreen';
import PlayListScreen from './PlayListScreen';
import LikesScreen from './LikesScreen';
import PlayListCreateScreen from './PlayListCreateScreen';
import NoAccountScreen from './NoAccountScreen';

const Stack = createStackNavigator();

export default function ProfileStackScreen() {
  return (
    <Stack.Navigator
      screenOptions={{
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="PlayListCreate" component={PlayListCreateScreen} />
      <Stack.Screen name="likes" component={LikesScreen} />
      <Stack.Screen name="PlayList" component={PlayListScreen} />
      <Stack.Screen
        name="NoAccount"
        component={NoAccountScreen}
        options={{
          cardStyleInterpolator:
            CardStyleInterpolators.forScaleFromCenterAndroid,
        }}
      />
      <Stack.Screen name="Follow" component={FollowScreen} />
    </Stack.Navigator>
  );
}
