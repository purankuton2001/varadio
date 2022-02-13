import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';

export default function NoAccountScreen(props) {
  const {navigation} = props;
  return (
    <View style={styles.container}>
      <Text style={styles.text}>アカウントを登録しよう！</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          navigation.reset({
            index: 0,
            routes: [{name: 'SignUp'}],
          });
        }}>
        <Text style={styles.buttonText}>登録</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'black',
    fontSize: 18,
    height: 24,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#F2994A',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 13,
    height: 16,
  },
});
