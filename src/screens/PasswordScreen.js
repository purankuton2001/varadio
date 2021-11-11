import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import {Input} from 'react-native-elements';
import PostButton from '../Icon/PostButton';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SignUpScreen(props) {
  const {navigation} = props;
  const [mail, setMail] = useState('');
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

  const handlePress = () => {
    auth()
      .sendPasswordResetEmail(mail)
      .then(() => {
        navigation.reset({
          index: 0,
          routes: [{name: 'Done'}],
        });
      })
      .catch(error => {
        Alert.alert(error.code);
      });
  };
  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.icon}>
        <PostButton size={96} color={'#F2994A'} />
      </View>
      <Input
        containerStyle={styles.input}
        placeholder="Mail Adress"
        onChangeText={value => setMail(value)}
        value={mail}
      />
      <TouchableOpacity style={styles.emmit} onPress={handlePress}>
        <Text style={styles.emmitText}>確認メールを送信</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  icon: {
    alignSelf: 'center',
    marginVertical: 32,
  },
  emmit: {
    width: '100%',
    margin: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2994A',
    borderRadius: 24,
  },
  emmitText: {
    fontSize: 14,
    height: 16,
    color: 'white',
  },
  buttons: {
    marginBottom: 48,
  },
  miniButton: {
    height: 24,
    alignSelf: 'flex-end',
  },
  miniText: {
    marginVertical: 8,
    fontSize: 14,
    height: 16,
    color: '#F2994A',
  },
});
