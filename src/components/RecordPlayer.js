import React from 'react';
import {StyleSheet, TouchableOpacity, View, Text, Image} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function RecordPlayer() {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Image
          source={{uri: 'https://reactjs.org/logo-og.png'}}
          style={styles.heroImage}
        />
        <View style={styles.remix}>
          <View style={styles.remixTitle}>
            <Icon name="music" size={24} color="white" />
            <Text style={styles.remixText}>神様の応援歌</Text>
          </View>
          <Image
            source={{uri: 'https://reactjs.org/logo-og.png'}}
            style={styles.remixImage}
          />
        </View>
      </View>
      <View style={styles.profile}>
        <View style={styles.profileTitle}>
          <Image
            source={{uri: 'https://reactjs.org/logo-og.png'}}
            style={styles.profileImage}
          />
          <Text style={styles.profileText}>神様</Text>
        </View>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>フォロー</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>信者必見！初心者の犯しがちなミス8選！？</Text>
      <View style={styles.controller}>
        <TouchableOpacity style={styles.controllerButton}>
          <Icon name="shuffle-variant" size={32} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controllerButton}>
          <Icon name="skip-previous" size={48} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.play}>
          <Icon name="play" size={48} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controllerButton}>
          <Icon name="skip-next" size={48} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>1.0x</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.controller}>
        <TouchableOpacity style={styles.controllerButton}>
          <Icon name="message-outline" size={32} color="#A7A7A7" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controllerButton}>
          <Icon name="share-variant" size={32} color="#A7A7A7" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controllerButton}>
          <Icon name="heart" size={32} color="#A7A7A7" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controllerButton}>
          <Icon name="playlist-plus" size={32} color="#A7A7A7" />
        </TouchableOpacity>
      </View>
      <View>
        <Text style={styles.description}>
          #信者初心者　＃信じる者は救われる　神です。
          信者が犯しがちな3つのミスを紹介しました。
        </Text>
        <TouchableOpacity style={styles.action}>
          <Text style={styles.actionText}>もっと見る</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0.9,
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: 'black',
    shadowOffset: {height: 1},
    shadowOpacity: 0.3,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  hero: {
    width: 304,
    height: 304,
    borderRadius: 152,
    alignSelf: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroImage: {
    width: 304,
    height: 304,
    borderRadius: 152,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  remix: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(242, 153, 74, 0.2)',
  },
  remixTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  remixText: {
    fontSize: 11,
    color: 'white',
  },
  remixImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  profile: {
    width: '100%',
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
    marginBottom: 24,
  },
  controller: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 24,
  },
  play: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F2994A',
    padding: 12,
  },
  description: {
    height: 16,
    fontSize: 14,
  },
  action: {
    alignSelf: 'flex-end',
  },
});
