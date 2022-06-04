import React, {useContext, useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useNFTBalance} from '../../hooks/useNFTBalance';
import {useMoralis} from 'react-moralis';
import {useWalletConnect} from '../../WalletConnect';

export default function RecordSellScreen(props) {
  const connector = useWalletConnect();
  const {Moralis, isAuthenticated, authenticate} = useMoralis();
  const {navigation} = props;

  useEffect(() => {
    console.log(NFTBalance);
  }, [NFTBalance]);
  const {NFTBalance} = useNFTBalance();

  function renderItem({item, index}) {
    return (
      item?.metadata?.recordId !== undefined && (
        <TouchableOpacity
          style={styles.item}
          onPress={() => {
            navigation.navigate('RecordSellPost', {
              recordId: item?.metadata?.recordId,
              tokenId: item?.token_id,
              recordAmount: item.amount,
            });
          }}>
          <Image source={{uri: item.image}} style={styles.image} />
          <View style={styles.description}>
            <Text style={styles.title}>{item.metadata?.name}</Text>
            <Text style={styles.amount}>所有数：{item.amount}</Text>
          </View>
        </TouchableOpacity>
      )
    );
  }
  return (
    <View
      style={[
        styles.container,
        {justifyContent: isAuthenticated ? 'flex-start' : 'center'},
      ]}>
      {isAuthenticated ? (
        <FlatList
          data={NFTBalance}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      ) : (
        <View style={styles.authenticateContainer}>
          <Text style={styles.authenticateText}>ウォレットに連携しよう！</Text>
          <TouchableOpacity
            onPress={() => {
              authenticate({connector});
            }}
            style={styles.authenticateButtonContainer}>
            <Text style={styles.authenticateButtonText}>連携</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    position: 'relative',
    backgroundColor: 'white',
  },
  cancel: {
    position: 'absolute',
    zIndex: 8,
    right: 8,
    top: 8,
  },
  item: {
    justifyContent: 'space-between',
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
  amount: {fontSize: 14},
  image: {
    borderRadius: 36,
    width: 72,
    height: 72,
    marginRight: 16,
  },
  description: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    height: 24,
    color: 'black',
    marginBottom: 8,
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
    right: 8,
    top: 8,
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
  authenticateContainer: {
    alignSelf: 'center',
    alignItems: 'center',
  },
  authenticateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 48,
  },
  authenticateButtonContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F2994A',
  },
  authenticateButtonText: {
    color: 'white',
  },
});
