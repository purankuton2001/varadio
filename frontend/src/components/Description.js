import React, {useContext} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  Linking,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {PlayerContext} from '../../App';
import {dateToString} from '../utils';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';

export default function Description({dislikesAmount, likesAmount}) {
  const navigation = useNavigation();
  const {state, dispatch} = useContext(PlayerContext);
  const {items, index} = state;
  const item = items[index];

  const openUrl = url => {
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
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.profile}
        onPress={() => {
          navigation.navigate('profile', {id: item.artist.id});
          dispatch({type: 'PLAYERTOGGLEOPEN'});
        }}>
        <View style={styles.profileTitle}>
          {item && item.artist && (
            <Image
              source={{uri: item.artist.profileImage}}
              style={styles.profileImage}
            />
          )}
          <Text style={styles.profileText}>
            {item && item.artist && item.artist.name}
          </Text>
        </View>
        {auth().currentUser.uid !== item.artist.id && (
          <TouchableOpacity
            style={[
              styles.button,
              {backgroundColor: follow ? 'white' : '#F2994A'},
            ]}
            onPress={followPress}>
            <Text
              style={[styles.buttonText, {color: follow ? 'black' : 'white'}]}>
              {followText()}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      <Text style={styles.title}>{item?.title}</Text>
      <View style={styles.infoContainer}>
        <View style={styles.infoValue}>
          <Icon name="play" size={16} />
          <Text style={styles.infoText}>{item.viewedAmount}回</Text>
        </View>
        <View style={styles.infoValue}>
          <Icon name="thumb-up" size={12} />
          <Text style={styles.infoText}>{likesAmount || 0}</Text>
        </View>
        <View style={styles.infoValue}>
          <Icon name="thumb-down" size={12} />
          <Text style={styles.infoText}>{dislikesAmount || 0}</Text>
        </View>
        <View style={styles.infoValue}>
          <Icon name="clock-outline" size={14} />
          <Text style={styles.infoText}>{dateToString(item.date)}</Text>
        </View>
      </View>
      <View style={styles.link}>
        <Icon name="link-variant" size={12} />
        <TouchableOpacity
          onPress={() => {
            openUrl(item.link);
          }}>
          <Text style={[styles.description, styles.linkText]}>{item.link}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.description}>
        <Text>{item && item.genre}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  profile: {
    marginVertical: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileText: {
    height: 24,
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileImage: {
    marginRight: 8,
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  button: {
    borderWidth: 1,
    borderRadius: 24,
    borderColor: '#F2994A',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'white',
  },
  buttonText: {
    fontSize: 13,
    height: 16,
    color: '#F2994A',
  },
  title: {
    fontWeight: 'bold',
    height: 24,
    fontSize: 20,
    marginTop: 8,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  linkText: {
    color: '#147EDF',
    textDecorationLine: 'underline',
    height: 16,
    fontSize: 14,
  },
  infoContainer: {
    marginVertical: 8,
    flexDirection: 'row',
    height: 16,
    alignItems: 'center',
  },
  infoText: {
    color: 'black',
    fontSize: 14,
    height: 16,
    marginHorizontal: 4,
    marginBottom: 2,
  },
  infoValue: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 16,
  },
});
