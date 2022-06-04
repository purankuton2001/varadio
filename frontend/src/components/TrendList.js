import {useNavigation} from '@react-navigation/native';
import React, {useContext} from 'react';
import {Alert, TouchableOpacity} from 'react-native';
import {StyleSheet, View, Text, Image, FlatList} from 'react-native';
import {PlayerContext} from '../../App';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TrendList({items, tab}) {
  const {dispatch} = useContext(PlayerContext);
  const navigation = useNavigation();
  function RenderPosts({item, index, recordPosts}) {
    return (
      <TouchableOpacity
        onPress={() => {
          console.log(index);
          dispatch({type: 'CONTENTSSELECT', items: recordPosts, index});
        }}>
        <Image source={{uri: item?.artwork}} style={styles.image} />
      </TouchableOpacity>
    );
  }
  function renderItem({item}) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.item}
          onPress={() => {
            navigation.navigate(tab, {item});
          }}>
          <View style={styles.header}>
            <Text style={styles.title}>{item?.title}</Text>
            {item.viewedAmount && (
              <View style={styles.infoValue}>
                <Icon name="play" size={16} />
                <Text style={styles.infoText}>{item.viewedAmount}回</Text>
              </View>
            )}
          </View>
          <FlatList
            horizontal
            style={styles.itemList}
            data={item.recordPosts}
            renderItem={({item: it, index}) => {
              return (
                <RenderPosts
                  item={it}
                  index={index}
                  recordPosts={item.recordPosts}
                  listKey={item => item.id}
                />
              );
            }}
          />
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <FlatList
      style={styles.listContainer}
      data={items}
      renderItem={renderItem}
      keyExtractor={item => item.id}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  listContainer: {
    marginBottom: 70,
  },
  item: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomColor: '#A7A7A7',
    borderBottomWidth: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    height: 28,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  infoValue: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 16,
  },
  itemList: {
    marginTop: 8,
  },
  image: {
    borderColor: '#FFA800',
    borderWidth: 0.5,
    borderRadius: 32,
    width: 64,
    height: 64,
    marginRight: 16,
  },
});
