import React, {useContext, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AddPlayList from './AddPlayList';
import {PlayerContext} from '../../App';
import {dateToString} from '../utils';
import auth from '@react-native-firebase/auth';

export default function RecordsList(props) {
  const navigation = useNavigation();
  const {items} = props;
  const [visible, setVisible] = useState(false);
  const [it, setIt] = useState();

  const changeVisible = st => {
    setVisible(st);
  };

  function renderItem({item, index}) {
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          navigation.navigate('Record', {item});
        }}>
        <Image source={{uri: item.artwork}} style={styles.image} />
        <View style={styles.description}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.infoText}>{item.artist.name}</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoValue}>
              <Icon name="play" size={16} />
              <Text style={styles.infoText}>3000回</Text>
            </View>
            <View style={styles.infoValue}>
              <Icon name="clock-outline" size={16} />
              <Text style={styles.infoText}>{dateToString(item.date)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
  return (
    <View style={styles.container}>
      <FlatList
        data={items}
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
    paddingVertical: 24,
    position: 'relative',
    paddingBottom: 80,
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
