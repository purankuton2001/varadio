import {useNavigation} from '@react-navigation/native';
import React from 'react';
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

export default function PlayList(props) {
  const navigation = useNavigation();
  const {item, items} = props;
  function openUrl(url) {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert(
          'エラー',
          'このページを開ませんでした',
          [{text: 'OK', onPress: () => console.log('OK Pressed')}],
          {cancelable: false},
        );
      }
    });
  }

  return (
    <View style={styles.container}>
      <Image source={{uri: item && item.artwork}} style={styles.image} />
      <Text style={styles.username}>{item && item.title}</Text>
      <Text style={styles.id}>by {item && item.artist.name} </Text>
      {item && item.description !== '' && (
        <View style={styles.description}>
          <Text>
            <Text style={styles.descriptionText}>
              {item && item.description}
            </Text>
          </Text>
        </View>
      )}
      {item && item.link !== '' && (
        <View style={styles.link}>
          <Icon name="link-variant" size={13} />
          <TouchableOpacity
            onPress={() => {
              openUrl(item.link);
            }}>
            <Text
              style={[styles.description, styles.linkText]}
              numberOfLines={1}>
              {item && item.link}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity
        style={styles.play}
        onPress={() => {
          navigation.navigate('player', {items});
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
    borderRadius: 24,
  },
  id: {
    height: 16,
    color: '#A7A7A7',
    fontSize: 13,
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
