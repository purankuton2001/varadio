import React from 'react';
import {StyleSheet, ScrollView, Alert} from 'react-native';
import {ListItem} from 'react-native-elements';
import firebase from '@react-native-firebase/app';

export default function SettingScreen(props) {
  const {navigation} = props;
  const logout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        navigation.reset({
          index: 0,
          routes: [{name: 'Main'}],
        });
      })
      .catch(error => {
        Alert.alert(error.code);
      });
  };
  return (
    <ScrollView style={styles.container}>
      <ListItem onPress={logout}>
        <ListItem.Content>
          <ListItem.Title>ログアウト</ListItem.Title>
        </ListItem.Content>
      </ListItem>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
