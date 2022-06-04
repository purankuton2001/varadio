import React, {useContext, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import {Overlay, Input} from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AddPlayList from './AddPlayList';
import {PlayerContext} from '../../App';
import {dateToString} from '../utils';
import auth from '@react-native-firebase/auth';
import {useMoralis} from 'react-moralis';
import {useMoralisDapp} from '../../providers/MoralisDappProvider/MoralisDappProvider';
import {useWalletConnect} from '../../WalletConnect';
import analytics from '@react-native-firebase/analytics';
import firestore from '@react-native-firebase/firestore';
import {BottomSheet} from 'react-native-elements';

export default function SellsList(props) {
  const [isVisible, setIsVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [it, setIt] = useState();
  const [amount, setAmount] = useState();
  const {marketAddress} = useMoralisDapp();
  const {
    Moralis,
    authenticate,
    authError,
    isAuthenticating,
    user,
    isAuthenticated,
    web3,
  } = useMoralis();
  const sellDelete = async () => {
    console.log(it.postId);
    const listItemFunction = 'ItemSellDelete';
    if (!isAuthenticated) await authenticate({connector});
    const data = web3.eth.abi.encodeFunctionCall(
      {
        name: listItemFunction,
        type: 'function',
        inputs: [{type: 'uint256', name: 'sellId'}],
      },
      [Number(it.sellId)],
    );
    transactionId = await connector.sendTransaction({
      data,
      from: connector.accounts[0],
      to: marketAddress,
    });
    firestore()
      .doc(`users/${auth().currentUser?.uid}/sells/${it.id}`)
      .delete()
      .then(() => {
        Alert.alert('出品の削除が完了しました。');
      });
  };

  const connector = useWalletConnect();
  const {items} = props;

  const handlePress = async () => {
    if (amount > 0) {
      console.log(it.sellId);
      const listItemFunction = 'ItemSold';
      if (!isAuthenticated) await authenticate({connector});
      const data = web3.eth.abi.encodeFunctionCall(
        {
          name: listItemFunction,
          type: 'function',
          inputs: [
            {type: 'uint256', name: 'sellId'},
            {type: 'uint256', name: 'amount'},
          ],
        },
        [Number(it.sellId), Number(amount)],
      );
      transactionId = await connector.sendTransaction({
        data,
        from: connector.accounts[0],
        to: marketAddress,
        value: Number(it.price) * Number(amount),
      });
      analytics().logEvent('record_transaction', {
        id: it.id,
        seller: it.seller,
        amount,
      });
      await firestore()
        .collection(`users/${auth().currentUser.uid}/buys`)
        .add({amount, item: it, record});
      // const request = {
      //   method: 'POST',
      //   headers: {
      //     'content-type': 'application/json',
      //   },
      //   body: JSON.stringify({amount, item: it, fromId: auth().currentUser.uid, record}),
      // };
      // fetch("https://us-central1-hitokoto-309511.cloudfunctions.net/onUsersBuyRecords", request)
      // .then(() => {
      Alert.alert('購入が完了しました！');
      setVisible(false);
      // })
    } else {
      Alert.alert('購入数を入力してください！');
    }
  };

  function renderItem({item, index}) {
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          setVisible(true);
          setIt(item);
        }}>
        <Image source={{uri: item?.record?.artwork}} style={styles.image} />
        <View style={styles.description}>
          <Text style={styles.itemTitle}>{item?.record?.title}</Text>
          <Text style={styles.infoText}>{item?.seller.name}</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoValue}>
              <Icon name="clock-outline" size={16} />
              <Text style={styles.infoText}>{dateToString(item?.date)}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.value}>{item?.price}</Text>
        <Text style={styles.minivalue}>v/個</Text>
        <Text style={styles.value}>{item.amount}個</Text>
        <TouchableOpacity
          onPress={() => {
            setIt(item);
            setIsVisible(true);
          }}
          style={styles.icon}>
          <Icon name="dots-vertical" size={20} color="black" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }
  return (
    <View style={styles.container}>
      {items && (
        <View style={styles.top}>
          <Text style={styles.topText}>値段</Text>
          <Text style={styles.topText}>販売数</Text>
        </View>
      )}
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
      <Overlay
        overlayStyle={styles.overlay}
        isVisible={visible}
        onBackdropPress={() => {
          setVisible(false);
        }}
        containerStyle={{backgroundColor: 'rgba(0.5, 0.25, 0, 0.2)'}}>
        <View style={styles.cell}>
          <Text style={styles.cellText}>購入数</Text>
          <Input
            keyboardType="number-pad"
            placeholder="Amount"
            containerStyle={styles.amount}
            value={amount}
            onChangeText={e => {
              setAmount(e);
            }}
          />
        </View>
        {amount !== undefined && (
          <View style={styles.cell}>
            <Text style={styles.cellText}>合計価格:</Text>
            <Text style={styles.cellPrice}>{amount * it?.price}v</Text>
          </View>
        )}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={() => {
              setVisible(false);
            }}>
            <Text style={styles.buttonText}>キャンセル</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={handlePress}>
            <Text style={styles.buttonText}>購入</Text>
          </TouchableOpacity>
        </View>
      </Overlay>
      <BottomSheet
        isVisible={isVisible}
        containerStyle={{
          backgroundColor: 'rgba(0.5, 0.25, 0, 0.2)',
        }}>
        {auth().currentUser?.uid === it?.seller.id && (
          <TouchableOpacity style={styles.bottomBotton} onPress={sellDelete}>
            <Text style={[styles.bottomText, {color: 'red'}]}>削除</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.bottomBotton}
          onPress={() => {
            setIsVisible(false);
            setIt(null);
          }}>
          <Text style={styles.bottomText}>キャンセル</Text>
        </TouchableOpacity>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 8,
    position: 'relative',
    paddingBottom: 80,
  },
  cell: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginTop: 16,
  },
  cellText: {
    paddingBottom: 8,
    fontSize: 18,
  },
  cellPrice: {
    fontSize: 24,
    paddingBottom: 8,
    fontWeight: 'bold',
    marginLeft: 24,
  },
  buttons: {
    marginTop: 24,
    flexDirection: 'row',
  },
  buttonContainer: {width: '50%', alignItems: 'center', height: 24},
  buttonText: {fontSize: 18},
  item: {
    borderRadius: 8,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: 'black',
    shadowOffset: {height: 1},
    shadowOpacity: 0.3,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 8,
  },
  topText: {
    paddingHorizontal: 12,
  },
  value: {
    fontSize: 24,
    marginLeft: 24,
  },
  minivalue: {
    fontSize: 12,
    paddingTop: 8,
  },
  description: {
    flex: 1,
    justifyContent: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    marginTop: 4,
    height: 16,
  },
  infoText: {
    color: 'black',
    fontSize: 13,
    height: 16,
    marginRight: 8,
  },
  infoValue: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 16,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 8,
  },
  icon: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
  overlay: {
    width: '80%',
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bottomBotton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    height: 56,
    alignItems: 'center',
  },
  bottomText: {
    height: 24,
    fontSize: 18,
    justifyContent: 'center',
    marginLeft: 4,
  },
  overlayTitle: {
    padding: 8,
    height: 48,
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: 'white',
  },
  button: {
    alignItems: 'flex-end',
    marginHorizontal: 32,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 16,
  },
});
