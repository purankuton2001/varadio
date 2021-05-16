import React from 'react';
import NoAccountScreen from './NoAccountScreen';
import NotificationScreen from './NotificationScreen';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';

const Stack = createStackNavigator();

export default function NotificationStackScreen(props) {
  return (
    <Stack.Navigator
      screenOptions={{
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}>
      <Stack.Screen name="Notification" component={NotificationScreen} />
      <Stack.Screen
        name="NoAccount"
        component={NoAccountScreen}
        options={{
          cardStyleInterpolator:
            CardStyleInterpolators.forScaleFromCenterAndroid,
        }}
      />
    </Stack.Navigator>
  );
}
