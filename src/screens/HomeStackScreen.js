import React from 'react';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import HomeScreen from './HomeScreen';
import TagScreen from './TagScreen';
import PlayListScreen from './PlayListScreen';

const Stack = createStackNavigator();

export default function HomeStackScreen() {
  return (
    <Stack.Navigator
      screenOptions={{
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Tag" component={TagScreen} />
      <Stack.Screen name="PlayList" component={PlayListScreen} />
    </Stack.Navigator>
  );
}
