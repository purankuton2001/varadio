/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect, useContext} from 'react';
import {
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  FlatList,
} from 'react-native';
import {EditorContext} from '../../App';
import CheckBox from '@react-native-community/checkbox';
import {Input, BottomSheet, Image, Overlay} from 'react-native-elements';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useValidation} from 'react-native-form-validator';
const RNFS = require('react-native-fs');
import {useMoralis, useWeb3Transfer} from 'react-moralis';
import {useMoralisDapp} from '../../providers/MoralisDappProvider/MoralisDappProvider';
import {useWalletConnect} from '../../WalletConnect';

export default function RecordPostScreen(props) {
  let transactionId;
  const {
    Moralis,
    authenticate,
    authError,
    isAuthenticating,
    user,
    isAuthenticated,
    web3,
  } = useMoralis();
  const connector = useWalletConnect();
  const {navigation, route} = props;
  const {tokenId, recordAmount, recordId} = route.params;
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const {marketAddress} = useMoralisDapp();
  const listItemFunction = 'ItemSellAdd';
  const {
    validate,
    isFieldInError,
    isFormValid,
    getErrorsInField,
    getErrorMessages,
  } = useValidation({
    state: {
      amount,
      price,
    },
  });
  const sellRef = firestore().collection(
    `users/${auth().currentUser.uid}/sells`,
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.postBotton} onPress={validateForm}>
          <Text style={styles.postText}>投稿</Text>
        </TouchableOpacity>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price, amount]);
  const validateForm = async () => {
    await validate({
      price: {required: true},
      amount: {required: true},
    });
    if (amount <= recordAmount) {
      console.log(isFormValid());
      if (isFormValid()) recordPost();
    } else {
      Alert.alert('所有数が足りません！');
    }
  };

  const recordPost = async () => {
    console.log(marketAddress);
    const data = web3.eth.abi.encodeFunctionCall(
      {
        name: listItemFunction,
        type: 'function',
        inputs: [
          {type: 'uint256', name: 'tokenId'},
          {type: 'uint256', name: 'price'},
          {type: 'uint256', name: 'amount'},
        ],
      },
      [tokenId, Number(price), Number(amount)],
    );
    transactionId = await connector.sendTransaction({
      data,
      from: connector.accounts[0],
      to: marketAddress,
      value: 'rinkeby',
    });
    sellRef
      .add({
        recordId,
        tokenId,
        price,
        amount,
        date: new Date(),
        seller: firestore().doc(`users/${auth().currentUser.uid}`),
        transactionId,
      })
      .then(() => {
        navigation.reset({
          index: 0,
          routes: [{name: 'Main'}],
        });
      })
      .catch(() => {
        Alert.alert('投稿に失敗しました。');
      });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.Cell}>
        <Text style={styles.bottomText}>値段</Text>
        <Input
          keyboardType="number-pad"
          placeholder="Price"
          containerStyle={styles.title}
          value={price}
          onChangeText={e => {
            setPrice(e);
          }}
        />
      </View>
      {isFieldInError('price') &&
        getErrorsInField('price').map(errorMessage => (
          <Text style={{color: 'red', alignSelf: 'center', marginBottom: 32}}>
            {errorMessage}
          </Text>
        ))}
      <View style={styles.Cell}>
        <View style={styles.CellLeft}>
          <Text style={styles.bottomText}>販売数</Text>
          <Text style={styles.ownAmount}>所有数：{recordAmount}</Text>
        </View>
        <Input
          keyboardType="number-pad"
          placeholder="Amount"
          containerStyle={styles.title}
          value={amount}
          onChangeText={e => {
            setAmount(e);
          }}
        />
      </View>
      {isFieldInError('amount') &&
        getErrorsInField('amount').map(errorMessage => (
          <Text style={{color: 'red', alignSelf: 'center', marginBottom: 32}}>
            {errorMessage}
          </Text>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  image: {
    width: 120,
    height: 120,
  },
  imageContainer: {
    borderWidth: 0.5,
    borderColor: '#F2994A',
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginTop: 32,
    overflow: 'hidden',
    borderRadius: 60,
  },
  tag: {
    height: 24,
    paddingHorizontal: 12,
    alignItems: 'center',
    left: 96,
    flexDirection: 'row',
  },
  tagText: {
    marginBottom: 4,
    height: 16,
    fontSize: 14,
    color: '#F2994A',
  },
  overlay: {
    width: '80%',
    height: '60%',
  },
  overlayTitle: {
    padding: 8,
    height: 48,
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: 'white',
  },
  bottomBotton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    height: 48,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  Cell: {
    flexDirection: 'row',
    backgroundColor: 'white',
    height: 48,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginVertical: 8,
    justifyContent: 'space-between',
  },
  CellLeft: {
    paddingTop: 8,
  },
  descriptionContainer: {
    position: 'relative',
    flexDirection: 'row',
    backgroundColor: 'white',
    height: 144,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginVertical: 8,
    justifyContent: 'space-between',
  },
  descriptionInner: {
    height: 144,
    marginRight: 72,
  },
  decription: {
    height: 144,
    fontSize: 18,
  },
  title: {
    height: 48,
    paddingRight: 80,
  },
  buttonText: {
    padding: 8,
    height: 48,
    fontSize: 18,
  },
  bottomText: {
    minWidth: 80,
    height: 24,
    fontSize: 18,
    marginLeft: 4,
    justifyContent: 'center',
  },
  button: {
    alignItems: 'flex-end',
    marginHorizontal: 32,
  },
  postText: {
    height: 24,
    fontSize: 18,
    justifyContent: 'center',
    color: '#F2994A',
  },
  postBotton: {
    marginRight: 12,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 16,
  },
  ownAmount: {
    fontSize: 12,
  },
});
