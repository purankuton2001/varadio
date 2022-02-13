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

export default function Description() {
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
      <View style={styles.profile}>
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
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>フォロー</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>{item && item.title}</Text>
      <View style={styles.infoContainer}>
        <View style={styles.infoValue}>
          <Icon name="play" size={16} />
          <Text style={styles.infoText}>3000回</Text>
        </View>
        <View style={styles.infoValue}>
          <Icon name="heart" size={12} />
          <Text style={styles.infoText}>200</Text>
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
    flexDirection: 'row',
    height: 16,
    alignItems: 'center',
  },
  infoText: {
    color: 'black',
    fontSize: 14,
    height: 16,
    marginRight: 8,
    marginBottom: 2,
  },
  infoValue: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 16,
  },
});
