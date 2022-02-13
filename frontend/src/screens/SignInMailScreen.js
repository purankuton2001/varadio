import React, {useState} from 'react';
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
import firebase from '@react-native-firebase/app';

export default function SignInMailScreen(props) {
  const {navigation} = props;
  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');

  const handlePress = () => {
    firebase
      .auth()
      .signInWithEmailAndPassword(mail, password)
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
      <Input
        containerStyle={styles.input}
        placeholder="Pass Word"
        onChangeText={value => setPassword(value)}
        value={password}
      />
      <TouchableOpacity style={styles.emmit} onPress={handlePress}>
        <Text style={styles.emmitText}>ログイン</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.miniButton}>
        <Text style={styles.miniText}>パスワードを忘れた方</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.miniButton}
        onPress={() => {
          navigation.reset({
            index: 0,
            routes: [{name: 'UpMail'}],
          });
        }}>
        <Text style={styles.miniText}>アカウントをお持ちでない方</Text>
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
  input: {
    marginBottom: 16,
  },
  icon: {
    alignSelf: 'center',
    marginVertical: 56,
  },
  emmit: {
    margin: 8,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2994A',
  },
  emmitText: {
    fontSize: 14,
    height: 16,
    color: 'white',
  },
  miniButton: {
    alignSelf: 'flex-end',
  },
  miniText: {
    marginVertical: 8,
    fontSize: 14,
    height: 16,
    color: '#F2994A',
  },
});
