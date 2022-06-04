import React from 'react';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import ReserchScreen from './ReserchScreen';
import TagScreen from './TagScreen';
import PlayListScreen from './PlayListScreen';
import ProfileScreen from './ProfileScreen';
import FollowScreen from './FollowScreen';
import RecordScreen from './RecordScreen';

const Stack = createStackNavigator();

export default function ReserchStackScreen() {
  return (
    <Stack.Navigator
      screenOptions={{
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}>
      <Stack.Screen name="Home" component={ReserchScreen} />
      <Stack.Screen
        name="profile"
        component={ProfileScreen}
        initialParams={{id: null}}
        getId={({params}) => params.id}
      />
      <Stack.Screen name="Tag" component={TagScreen} />
      <Stack.Screen name="Record" component={RecordScreen} />
      <Stack.Screen name="PlayList" component={PlayListScreen} />
      <Stack.Screen
        name="Follow"
        component={FollowScreen}
        getId={({params}) => params.id}
      />
    </Stack.Navigator>
  );
}
