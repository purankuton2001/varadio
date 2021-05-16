import React from 'react';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import ReserchScreen from './ReserchScreen';
import TagScreen from './TagScreen';
import PlayListScreen from './PlayListScreen';

const Stack = createStackNavigator();

export default function ReserchStackScreen() {
  return (
    <Stack.Navigator
      screenOptions={{
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}>
      <Stack.Screen name="Home" component={ReserchScreen} />
      <Stack.Screen name="Tag" component={TagScreen} />
      <Stack.Screen name="PlayList" component={PlayListScreen} />
    </Stack.Navigator>
  );
}
