import React from 'react';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import FollowScreen from './FollowScreen';
import ProfileScreen from './ProfileScreen';
import PlayListScreen from './PlayListScreen';
import RecordScreen from './RecordScreen';
import PlayListEditScreen from './PlayListEditScreen';
import LikesScreen from './LikesScreen';
import ViewedScreen from './ViewedScreen';
import PlayListCreateScreen from './PlayListCreateScreen';
import NoAccountScreen from './NoAccountScreen';
import TagScreen from './TagScreen';


const Stack = createStackNavigator();

export default function ProfileStackScreen() {
  return (
    <Stack.Navigator
      screenOptions={{
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}>
      <Stack.Screen
      name="profile"
      component={ProfileScreen}
      initialParams={{ id: null }}
      getId={({ params }) => params.id}
      />
      <Stack.Screen name="Tag" component={TagScreen} />
      <Stack.Screen name="PlayListCreate" component={PlayListCreateScreen} />
      <Stack.Screen name="likes" component={LikesScreen} />
      <Stack.Screen name="Viewed" component={ViewedScreen} />
      <Stack.Screen name="PlayList" component={PlayListScreen} />
      <Stack.Screen name="Record" component={RecordScreen} />
      <Stack.Screen name="PlayListEdit" component={PlayListEditScreen} />
      <Stack.Screen
        name="NoAccount"
        component={NoAccountScreen}
        options={{
          cardStyleInterpolator:
            CardStyleInterpolators.forScaleFromCenterAndroid,
        }}
      />
      <Stack.Screen name="Follow" component={FollowScreen} getId={({ params }) => params.id} />
    </Stack.Navigator>
  );
}
