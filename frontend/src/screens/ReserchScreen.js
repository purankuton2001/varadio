import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {SearchBar} from 'react-native-elements';
import {ScrollView} from 'react-native';
import TrendList from '../components/TrendList';

export default function ReserchScreen() {
  const [state, setState] = useState();
  const updateSearch = search => {
    setState(search);
  };
  return (
    <ScrollView style={styles.container}>
      <SearchBar
        style={styles.serch}
        placeholder="Serch Contents"
        onChangeText={updateSearch}
        value={state}
        lightTheme
        showLoading
        showCancel
      />
      <TrendList />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
