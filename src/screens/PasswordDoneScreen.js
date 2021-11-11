import React, {useEffect} from 'react';
import {StyleSheet, View, TouchableOpacity, Text} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SignUpScreen(props) {
  const {navigation} = props;
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          // eslint-disable-next-line react-native/no-inline-styles
          style={{marginRight: 8}}
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{name: 'Main'}],
            });
          }}>
          <Icon name="close" size={36} />
        </TouchableOpacity>
      ),
    });
  });
  return (
    <View style={styles.container} behavior="padding">
      <Text style={styles.text}>確認メールを送信しました。</Text>
      <Text style={styles.text2}>メール内に記載されたリンクから</Text>
      <Text style={styles.text2}>作業を完了させてください。</Text>
      <TouchableOpacity
        style={styles.emmit}
        onPress={() => {
          navigation.reset({
            index: 0,
            routes: [{name: 'SignIn'}],
          });
        }}>
        <Text style={styles.emmitText}>ログイン画面に戻る</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 18,
    height: 24,
    color: 'black',
    marginBottom: 24,
  },
  text2: {
    fontSize: 18,
    height: 24,
    color: 'black',
  },
  emmit: {
    width: '100%',
    margin: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2994A',
    borderRadius: 24,
    marginTop: 80,
  },
  emmitText: {
    fontSize: 14,
    height: 16,
    color: 'white',
  },
});
