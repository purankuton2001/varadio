import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

export default function PlayListRecommend() {
  const navigation = useNavigation();
  function handlePress() {
    navigation.navigate('PlayList');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>おすすめのプレイリスト</Text>
      <ScrollView style={styles.itemList} horizontal>
        <TouchableOpacity style={styles.item} onPress={handlePress}>
          <Image
            source={{uri: 'https://reactjs.org/logo-og.png'}}
            style={styles.image}
          />
          <Text style={styles.itemTitle}>声真似集</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    elevation: 4,
    shadowColor: 'black',
    shadowOffset: {height: 1},
    shadowOpacity: 0.3,
    backgroundColor: 'white',
  },
  title: {
    height: 24,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 32,
    color: 'black',
  },
  itemList: {
    flex: 1,
    paddingBottom: 24,
  },
  item: {
    alignItems: 'center',
    marginRight: 24,
  },
  image: {
    borderRadius: 24,
    width: 184,
    height: 184,
    marginBottom: 24,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    height: 24,
    color: 'black',
    marginBottom: 8,
  },
});
