import React, {useContext} from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  FlatList,
} from 'react-native';
import {PlayerContext} from '../../App';

export default function PostTrendList({items}) {
  const {dispatch} = useContext(PlayerContext);
  function handlePress(items, index) {
    dispatch({type: 'CONTENTSSELECT', items, index});
  }

  function renderItem({item, index}) {
    return(
    <TouchableOpacity style={styles.item} onPress={() => {handlePress(items, index)}}>
      <Image source={{uri: item.artwork}} style={styles.image} />
      <Text style={styles.itemTitle}>{item.title}</Text>
    </TouchableOpacity>);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>急上昇</Text>
      <FlatList
        keyExtractor={item => item.id}
        renderItem={renderItem}
        data={items}
        style={styles.itemList}
        horizontal
      />
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
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#FFA800',
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
    borderRadius: 92,
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
