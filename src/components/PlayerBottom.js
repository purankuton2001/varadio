import React, {useContext} from 'react';
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

export default function PlayerBottom(props) {
  const {height} = Dimensions.get('window');
  const {tab, changeTab} = props;
  const {state, dispatch} = useContext(PlayerContext);
  const {items} = state;

  return (
    <View style={[styles.container, {height}]}>
      <View style={styles.topTab}>
        <TouchableOpacity
          style={styles.cancel}
          onPress={() => {
            changeTab(false);
          }}>
          <Icon name="chevron-down" size={40} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topTabItem}
          onPress={() => {
            changeTab('next');
          }}>
          <Text style={styles.topTabText}>Next</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topTabItem}
          onPress={() => {
            changeTab('description');
          }}>
          <Text style={styles.topTabText}>Description</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topTabItem}
          onPress={() => {
            changeTab('comments');
          }}>
          <Text style={styles.topTabText}>Comments</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topTabItem}
          onPress={() => {
            changeTab('related');
          }}>
          <Text style={styles.topTabText}>Related</Text>
        </TouchableOpacity>
      </View>
      <ScrollView>
        {tab === 'next' && (
          <DraggableList
            items={items}
            dragEnd={({data}) => {
              dispatch({type: 'ITEMSUPDATE', data});
            }}
          />
        )}
        {tab === 'description' && <Description />}
        {tab === 'description' && <Description />}
        {tab === 'description' && <Description />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  cancel: {
    zIndex: 10,
    position: 'absolute',
    left: '50%',
    top: -8,
  },
  topTab: {
    position: 'relative',
    height: 64,
    paddingTop: 16,
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#F2994A',
  },
  topTabItem: {
    width: '25%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTabText: {
    height: 16,
    fontSize: 13,
    color: 'white',
  },
});
