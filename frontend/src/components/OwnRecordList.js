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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AddPlayList from './AddPlayList';
import {EditorContext} from '../../App';
import {dateToString} from '../utils';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default function OwnRecordList(props) {
  const {close} = props;
  useEffect(() => {
    getNFTBalance();
  }, []);
  const {getNFTBalance, NFTBalance} = useNFTBalance();
  const {editorState, editorDispatch} = useContext(EditorContext);
  const [visible, setVisible] = useState(false);
  const [it, setIt] = useState();

  const changeVisible = st => {
    setVisible(st);
  };

  function renderItem({item, index}) {
    const used = editorState.records.filter(e => e.tokenId === item.token_id);
    return (
      item?.metadata?.recordId !== undefined && (
        <TouchableOpacity
          style={styles.item}
          onPress={() => {
            if (!used || item.amount - used.length > 0) {
              console.log(item.metadata.recordId);
              firestore()
                .doc(`records/${item.metadata.recordId}`)
                .get()
                .then(record => {
                  const data = record.data();
                  editorDispatch({
                    type: 'RECORDSADD',
                    records: {
                      tokenId: item.token_id,
                      title: data.title,
                      genre: data.genre,
                      artwork: data.artwork,
                      id: editorState.records.length,
                      recordId: item.metadata.recordId,
                      url: data.url,
                      start: 0,
                      duration: data.duration,
                      end: data.duration,
                      volume: 100,
                      artist: data.artist.id,
                      storageId: data.storageId,
                      rate: 1,
                      tags: data.tags,
                      genre: data.genre,
                    },
                  });
                  close();
                });
            } else {
              Alert.alert('所有数が足りません');
            }
          }}>
          <Image source={{uri: item.image}} style={styles.image} />
          <View style={styles.description}>
            <Text style={styles.title}>{item.metadata?.name}</Text>
            <Text
              style={[
                styles.amount,
                {
                  color:
                    used && item.amount - used.length <= 0 ? 'red' : 'black',
                },
              ]}>
              所有数：{used ? item.amount - used.length : item.amount}
            </Text>
          </View>
        </TouchableOpacity>
      )
    );
  }
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.cancel}
        onPress={() => {
          close();
        }}>
        <Icon name="chevron-down" size={40} color="black" />
      </TouchableOpacity>
      <FlatList
        data={NFTBalance}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
      <AddPlayList changeVisible={changeVisible} visible={visible} item={it} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 64,
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
});
