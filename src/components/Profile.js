import React from 'react';
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

export default function Profile(props) {
  const {profile} = props;
  const navigation = useNavigation();
  const handlePress = () => {
    navigation.navigate('ProfileEdit', {profile});
  };
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
        source={{uri: profile && profile.profileImage}}
        style={styles.image}
      />
      <Text style={styles.username}>{profile && profile.name}</Text>
      <Text style={styles.id}>@{profile && profile.id}</Text>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>編集</Text>
      </TouchableOpacity>
      <View style={styles.follow}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Follow');
          }}>
          <Text style={styles.followText}>フォロー 2,000</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Follow');
          }}>
          <Text style={styles.followText}>フォロワー 0</Text>
        </TouchableOpacity>
      </View>
      {profile && profile.description !== '' && (
        <View style={styles.description}>
          <Text>
            <Text style={styles.descriptionText}>
              {profile && profile.description}
            </Text>
          </Text>
        </View>
      )}
      {profile && profile.link !== '' && (
        <View style={styles.link}>
          <Icon name="link-variant" size={13} />
          <TouchableOpacity
            onPress={() => {
              openUrl(profile.link);
            }}>
            <Text
              style={[styles.description, styles.linkText]}
              numberOfLines={1}>
              {profile && profile.link}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 24,
    alignItems: 'center',
  },
  image: {
    width: 96,
    height: 96,
    marginBottom: 8,
    borderRadius: 24,
  },
  username: {
    marginVertical: 8,
    height: 24,
    fontSize: 20,
    fontWeight: 'bold',
  },
  id: {
    height: 16,
    color: '#A7A7A7',
    fontSize: 14,
  },
  button: {
    marginVertical: 24,
    paddingVertical: 4,
    borderWidth: 1,
    borderRadius: 12,
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
  },
  followText: {
    marginHorizontal: 24,
    fontWeight: 'bold',
    height: 20,
    fontSize: 16,
  },
  description: {
    marginTop: 16,
    width: '80%',
    alignItems: 'center',
  },
  descriptionText: {
    height: 16,
    fontSize: 14,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    color: '#147EDF',
    textDecorationLine: 'underline',
    width: '100%',
    marginBottom: 16,
  },
});
