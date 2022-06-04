import React, {useContext, useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
  Keyboard,
} from 'react-native';
import {BottomSheet} from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AddPlayList from './AddPlayList';
import {PlayerContext} from '../../App';
import {dateToString} from '../utils';
import auth from '@react-native-firebase/auth';
import {useMoralis} from 'react-moralis';
import {useMoralisDapp} from '../../providers/MoralisDappProvider/MoralisDappProvider';
import {useWalletConnect} from '../../WalletConnect';
import firestore from '@react-native-firebase/firestore';

export default function NextList({items, idx}) {
  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', _keyboardDidShow);
    Keyboard.addListener('keyboardDidHide', _keyboardDidHide);

    // cleanup function
    return () => {
      Keyboard.removeListener('keyboardDidShow', _keyboardDidShow);
      Keyboard.removeListener('keyboardDidHide', _keyboardDidHide);
    };
  }, []);

  const [keyboardStatus, setKeyboardStatus] = useState(undefined);
  const _keyboardDidShow = () => setKeyboardStatus(true);
  const _keyboardDidHide = () => setKeyboardStatus(false);

  console.log(items);
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
  const connector = useWalletConnect();
  const {dispatch} = useContext(PlayerContext);
  const [visible, setVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [it, setIt] = useState();

  const postDelete = async () => {
    console.log(it.postId);
    const listItemFunction = 'DeletePost';
    if (!isAuthenticated) await authenticate({connector});
    const data = web3.eth.abi.encodeFunctionCall(
      {
        name: listItemFunction,
        type: 'function',
        inputs: [{type: 'uint256', name: 'postId'}],
      },
      [Number(it.postId)],
    );
    transactionId = await connector.sendTransaction({
      data,
      from: connector.accounts[0],
      to: marketAddress,
      value: 'rinkeby',
    });
    firestore()
      .doc(`users/${auth().currentUser?.uid}/posts/${it.id}`)
      .delete()
      .then(() => {
        Alert.alert('投稿の削除が完了しました。');
      });
  };
  const changeVisible = st => {
    setVisible(st);
  };

  const iconPress = () => {
    if (auth().currentUser) {
      setVisible(!visible);
    }
  };

  function renderItem({item, index}) {
    const opacity = index < idx ? 0.2 : 1;
    return (
      <TouchableOpacity
        style={[styles.item, {opacity}]}
        onPress={() => {
          dispatch({type: 'CONTENTSSELECT', items, index});
        }}>
        <Image
          source={{uri: item.artwork}}
          style={[
            styles.image,
            {
              borderWidth: idx === index ? 3 : 0,
            },
          ]}
        />
        <View style={styles.description}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>{item.title}</Text>
            {idx === index && <Text style={styles.titlePlaying}>再生中</Text>}
          </View>
          <Text style={styles.infoText}>{item.artist.name}</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoValue}>
              <Icon name="play" size={16} />
              <Text style={styles.infoText}>{item.viewedAmount}回</Text>
            </View>
            <View style={styles.infoValue}>
              <Icon name="clock-outline" size={16} />
              <Text style={styles.infoText}>{dateToString(item.date)}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            setIt(item);
            setIsVisible(true);
          }}
          style={styles.icon}>
          <Icon name="dots-vertical" size={24} color="black" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }
  return (
    <View style={[styles.container, {paddingBottom: keyboardStatus ? 0 : 80}]}>
      <FlatList
        data={items}
        renderItem={useCallback(renderItem, [idx])}
        keyExtractor={useCallback(item => item.id, [idx])}
      />
      <AddPlayList changeVisible={changeVisible} visible={visible} item={it} />
      <BottomSheet
        isVisible={isVisible}
        containerStyle={{
          backgroundColor: 'rgba(0.5, 0.25, 0, 0.2)',
        }}>
        <TouchableOpacity
          style={styles.bottomBotton}
          onPress={() => {
            iconPress();
          }}>
          <Text style={styles.bottomText}>プレイリストに追加</Text>
        </TouchableOpacity>
        {auth().currentUser?.uid === it?.artist.id && (
          <TouchableOpacity style={styles.bottomBotton} onPress={postDelete}>
            <Text style={[styles.bottomText, {color: 'red'}]}>削除</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.bottomBotton}
          onPress={() => {
            setIsVisible(false);
          }}>
          <Text style={styles.bottomText}>キャンセル</Text>
        </TouchableOpacity>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBotton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    height: 48,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  bottomText: {
    minWidth: 80,
    height: 24,
    fontSize: 18,
    marginLeft: 4,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    position: 'relative',
  },
  item: {
    borderRadius: 40,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: 'black',
    shadowOffset: {height: 1},
    shadowOpacity: 0.3,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  image: {
    borderRadius: 36,
    width: 72,
    height: 72,
    marginRight: 16,
    borderColor: '#FFA800',
  },
  description: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    height: 24,
    color: 'black',
    marginBottom: 8,
    marginRight: 4,
  },
  titlePlaying: {
    fontWeight: 'bold',
    color: '#FFA800',
  },
  titleContainer: {
    flexDirection: 'row',
  },
  infoContainer: {
    flexDirection: 'row',
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
  icon: {
    position: 'absolute',
    right: 16,
    top: 12,
  },
  overlay: {
    width: '80%',
    height: '60%',
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
  buttonText: {
    padding: 8,
    height: 48,
    fontSize: 18,
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
