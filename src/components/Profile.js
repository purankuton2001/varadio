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

export default function Profile() {
  const link = 'https://ja.wikipedia.org/wiki/%E7%A5%9E';
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
      <Image
        source={{uri: 'https://reactjs.org/logo-og.png'}}
        style={styles.image}
      />
      <Text style={styles.username}>神様</Text>
      <Text style={styles.id}>@kamikami</Text>
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>フォロー</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Icon name="email-outline" size={24} color="#F2994A" />
        </TouchableOpacity>
      </View>
      <View style={styles.follow}>
        <Text style={styles.followText}>フォロー 2,000</Text>
        <Text style={styles.followText}>フォロワー 0</Text>
      </View>
      <Text style={styles.description}>私は神です。信仰してください</Text>
      <View style={styles.link}>
        <Icon name="link-variant" size={12} />
        <TouchableOpacity onPress={openUrl(link)}>
          <Text style={[styles.description, styles.linkText]}>{link}</Text>
        </TouchableOpacity>
      </View>
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
  username: {
    marginBottom: 4,
    height: 24,
    fontSize: 18,
    fontWeight: 'bold',
  },
  id: {
    height: 16,
    color: '#A7A7A7',
    fontSize: 14,
    marginBottom: 24,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    height: 40,
    width: 156,
  },
  button: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#F2994A',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  buttonText: {
    fontSize: 18,
    height: 24,
    color: '#F2994A',
  },
  follow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 24,
    width: 276,
    marginBottom: 32,
  },
  followText: {
    fontWeight: 'bold',
    height: 24,
    fontSize: 18,
  },
  description: {
    height: 16,
    fontSize: 14,
    marginBottom: 8,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    color: '#147EDF',
    textDecorationLine: 'underline',
  },
});
