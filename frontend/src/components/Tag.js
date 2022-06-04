import React, {useContext} from 'react';
import {useNavigation} from '@react-navigation/native';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  Linking,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {PlayerContext} from '../../App';

export default function Tag(props) {
  const {dispatch} = useContext(PlayerContext);
  const navigation = useNavigation();
  const {item, items} = props;
  console.log(item);

  return (
    <View style={styles.container}>
      <Image source={{uri: item.artwork}} style={styles.image} />
      <Text style={styles.username}>{item.title}</Text>
      <TouchableOpacity
        style={styles.play}
        onPress={() => {
          dispatch({type: 'CONTENTSSELECT', items, index: 0});
        }}>
        <Icon name="play" size={48} color="white" />
      </TouchableOpacity>
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
    marginBottom: 8,
    borderRadius: 48,
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
  description: {
    height: 16,
    fontSize: 14,
    marginVertical: 24,
  },
});
