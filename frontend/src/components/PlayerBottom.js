import React, {useContext, useState} from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Description from './Description';
import DraggableList from './DraggableList';
import {PlayerContext} from '../../App';
import CommentListScreen from '../screens/CommentListScreen';

export default function PlayerBottom(props) {
  const {height} = Dimensions.get('window');
  const {tab, changeTab} = props;
  const {state, dispatch} = useContext(PlayerContext);
  const [items, setItems] = useState(state.items);

  return (
    <View style={[styles.container, {height}]}>
      {tab !== false &&
      <TouchableOpacity
        style={styles.cancel}
        onPress={() => {
          changeTab(false);
        }}>
        <Icon name="chevron-down" size={40} color="white" />
      </TouchableOpacity>}
      <View style={styles.topTab}>
        <TouchableOpacity
          style={styles.topTabItem}
          onPress={() => {
            changeTab('next');
          }}>
          <Text style={[styles.topTabText, {color: tab == 'next' ? 'red' : 'white'}]}>Next</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topTabItem}
          onPress={() => {
            changeTab('description');
          }}>
          <Text style={[styles.topTabText, {color: tab == 'description' ? 'red' : 'white'}]}>Description</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topTabItem}
          onPress={() => {
            changeTab('comments');
          }}>
          <Text style={[styles.topTabText, {color: tab == 'comments' ? 'red' : 'white'}]}>Comments</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topTabItem}
          onPress={() => {
            changeTab('related');
          }}>
          <Text style={[styles.topTabText, {color: tab == 'related' ? 'red' : 'white'}]}>Related</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tabContent}>
        {tab === 'next' && (
          <DraggableList
            items={items}
            dragEnd={({data}) => {
              setItems(data);
              dispatch({type: 'ITEMSUPDATE', data});
            }}
          />
        )}
        {tab === 'description' && <Description />}
        {tab === 'comments' && <CommentListScreen />}
        {tab === 'related' && <Description />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  tabContent: {
    flex: 1,
  },
  cancel: {
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: '#F2994A',
  },
  topTab: {
    position: 'relative',
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#F2994A',
  },
  topTabItem: {
    width: '25%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTabText: {
    height: 16,
    fontSize: 13,
    color: 'white',
  },
});
