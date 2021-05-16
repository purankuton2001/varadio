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
import firebase from '@react-native-firebase/app';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {
  LoginManager,
  AccessToken,
  GraphRequest,
  GraphRequestManager,
} from 'react-native-fbsdk-next';
import {SocialIcon} from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {translateError} from '../utils';
import firestore from '@react-native-firebase/firestore';

export default function SignUpScreen(props) {
  const {navigation} = props;
  const [name, setName] = useState('');
  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');

  const infoRequest = new GraphRequest(
    '/me',
    {
      parameters: {
        fields: {
          string: 'picture,name',
        },
      },
    },
    (err, res) => {
      const ref = firestore()
        .collection('users')
        .doc(`${auth().currentUser.uid}`);
      console.log(err, res);
      ref.set({
        name: res.name,
        profileImage: res.picture.data.url,
        description: '',
        id: auth().currentUser.uid,
      });
    },
  );

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '56470386968-opilkn4qfh5v4kik5a6udvmn6ugqbot6.apps.googleusercontent.com',
    });
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
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

  async function onGoogleButtonPress() {
    await GoogleSignin.hasPlayServices();
    const {idToken} = await GoogleSignin.signIn().catch(error => {
      const errMsg = translateError(error.code);
      Alert.alert(errMsg.title, errMsg.description);
    });
    const googleCredential = firebase.auth.GoogleAuthProvider.credential(
      idToken,
    );
    return firebase
      .auth()
      .signInWithCredential(googleCredential)
      .catch(error => {
        const errMsg = translateError(error.code);
        Alert.alert(errMsg.title, errMsg.description);
      });
  }

  async function onFacebookButtonPress() {
    // Attempt login with permissions
    const result = await LoginManager.logInWithPermissions([
      'public_profile',
      'email',
    ]);

    if (result.isCancelled) {
      throw 'User cancelled the login process';
    }

    const data = await AccessToken.getCurrentAccessToken();

    if (!data) {
      throw 'Something went wrong obtaining access token';
    }

    const facebookCredential = firebase.auth.FacebookAuthProvider.credential(
      data.accessToken,
    );

    return firebase.auth().signInWithCredential(facebookCredential);
  }

  const handlePress = () => {
    if (name && mail && password) {
      auth()
        .createUserWithEmailAndPassword(mail, password)
        .then(() => {
          const ref = firestore()
            .collection('users')
            .doc(`${auth().currentUser.uid}`);
          ref.set({
            name,
            description: '',
            id: auth().currentUser.uid,
          });
          navigation.reset({
            index: 0,
            routes: [{name: 'Main'}],
          });
        })
        .catch(error => {
          const errMsg = translateError(error.code);
          Alert.alert(errMsg.title, errMsg.description);
        });
    } else {
      Alert.alert('エラー', '未記入の欄があります。');
    }
  };
  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.icon}>
        <PostButton size={96} color={'#F2994A'} />
      </View>
      <Input
        containerStyle={styles.input}
        placeholder="User Name"
        onChangeText={value => setName(value)}
        value={name}
      />
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
        <Text style={styles.emmitText}>サインアップ</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.miniButton}
        onPress={() => {
          navigation.reset({
            index: 0,
            routes: [{name: 'SignIn'}],
          });
        }}>
        <Text style={styles.miniText}>既にアカウントをお持ちの方</Text>
      </TouchableOpacity>
      <SocialIcon
        title="Sign In With Google"
        button
        type="google"
        onPress={() => {
          onGoogleButtonPress().then(async () => {
            const ref = firestore()
              .collection('users')
              .doc(`${auth().currentUser.uid}`);
            const {user} = await GoogleSignin.getCurrentUser();
            ref.set({
              name: user.name,
              profileImage: user.photo,
              description: '',
              id: auth().currentUser.uid,
              link: '',
            });
            navigation.reset({
              index: 0,
              routes: [{name: 'Main'}],
            });
          });
        }}
      />
      <SocialIcon
        title="Sign In With Facebook"
        button
        type="facebook"
        onPress={() => {
          onFacebookButtonPress().then(async () => {
            await new GraphRequestManager().addRequest(infoRequest).start();
            navigation.reset({
              index: 0,
              routes: [{name: 'Main'}],
            });
          });
        }}
      />
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
  miniButton: {
    alignSelf: 'flex-end',
    marginBottom: 56,
  },
  miniText: {
    marginVertical: 8,
    fontSize: 14,
    height: 16,
    color: '#F2994A',
  },
});
