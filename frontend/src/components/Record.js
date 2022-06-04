import React, {useContext, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  Linking,
  Alert,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SoundPlayer from 'react-native-sound-player';
import {PlayerContext} from '../../App';

export default function Record(props) {
  useEffect(() => {
    SoundPlayer.loadUrl(item?.url);
  }, []);
  const navigation = useNavigation();
  const {item, items} = props;
  const {dispatch} = useContext(PlayerContext);
  function renderTag({item}) {
    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('Tag', {item});
        }}>
        <Text style={styles.tagTitle}>{item}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View>
        <TouchableOpacity
          style={styles.miniPlay}
          onPress={() => {
            SoundPlayer.play();
          }}>
          <Icon name="play" size={24} color="white" />
        </TouchableOpacity>
        <Image source={{uri: item?.artwork}} style={styles.image} />
      </View>
      <Text style={styles.username}>{item?.title}</Text>
      <Text style={styles.id}>by {item?.artist?.name} </Text>
      {item?.tags.length !== 0 && (
        <FlatList
          horizontal
          scrollEnabled={false}
          nestedScrollEnabled={true}
          data={item.tags}
          renderItem={renderTag}
          keyExtractor={item => item.id}
        />
      )}
      {item?.genre !== '' && (
        <View style={styles.description}>
          <Text>
            <Text style={styles.descriptionText}>{item?.genre}</Text>
          </Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.play}
        onPress={() => {
          dispatch({type: 'CONTENTSSELECT', items, index: 0});
        }}>
        <Icon name="play" size={48} color="white" />
      </TouchableOpacity>
      <Text style={styles.amount}>流通量：{item.amount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: 'black',
    shadowOffset: {height: 1},
    shadowOpacity: 0.3,
    paddingVertical: 24,
    alignItems: 'center',
  },
  image: {
    width: 96,
    height: 96,
    marginBottom: 24,
    borderRadius: 48,
  },
  amount: {
    marginTop: 24,
  },
  nftImage: {
    width: 96,
    height: 96,
    marginBottom: 24,
    borderRadius: 48,
  },
  tagTitle: {
    color: '#F2994A',
    marginVertical: 4,
  },
  id: {
    height: 16,
    color: '#A7A7A7',
    fontSize: 13,
    marginBottom: 16,
  },
  username: {
    marginBottom: 4,
    height: 24,
    fontSize: 18,
    fontWeight: 'bold',
  },
  play: {
    marginTop: 16,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F2994A',
    padding: 12,
  },
  miniPlay: {
    bottom: 16,
    right: -8,
    zIndex: 10,
    position: 'absolute',
    marginTop: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2994A',
    padding: 12,
  },
  description: {
    height: 16,
    fontSize: 14,
    marginVertical: 24,
  },
});
