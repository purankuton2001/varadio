import {format} from 'date-fns';
import firestore from '@react-native-firebase/firestore';

export function dateToString(date) {
  if (!date) {
    return '';
  }
  return format(date, 'yyyy年M月d日 HH時mm分');
}

export function idToName(id) {
  if (!id) {
    return '';
  } else {
    const ref = firestore().collection('users').doc(id);
    ref.get().then(doc => {
      const data = doc.data();
      const name = data.name;
      console.log(name);
      return name;
    });
  }
}

export function translateError(code) {
  const message = {
    title: 'エラー',
    description: '時間をおいてもう一度やり直してください',
  };

  switch (code) {
    case 'auth/invalid-email':
      message.description = 'メールアドレスが不正です。';
      break;
    case 'auth/user-disabled':
      message.description = 'ユーザーが無効です。';
      break;
    case 'auth/user-not-found':
      message.description = 'ユーザーが見つかりません。';
      break;
    case 'auth/wrong-password':
      message.description = 'パスワードが間違っています。';
      break;
    case 'auth/email-already-in-use':
      message.description = 'このメールアドレスは既に使われています。';
      break;
    case 'auth/operation-not-allowed':
      message.description = 'メールアドレス又はパスワードが不正です。';
      break;
    case 'auth/weak-password':
      message.description = 'パスワードが簡単すぎます。';
      break;
    default:
  }
  return message;
}

export const firebaseConfig = {
  apiKey: 'AIzaSyA5OGbz6Ti2e9SgbDgIKvaxpL_MSj3FZxA',
  authDomain: 'hitokoto-309511.firebaseapp.com',
  projectId: 'hitokoto-309511',
  storageBucket: 'hitokoto-309511.appspot.com',
  messagingSenderId: '56470386968',
  appId: '1:56470386968:web:a00d99c32e013139bc866d',
  measurementId: 'G-5VDCBVVEF3',
};
