import React, {useState} from 'react';
import {
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Trimmer from 'react-native-trimmer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SoundLayer() {
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(30000);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.controllerButton}>
        <Icon name="music-note" size={56} color="#F2994A" />
      </TouchableOpacity>
      <ScrollView horizontal>
        <View style={styles.trimmer}>
          <Trimmer
            onHandleChange={k => {
              setStart(k.leftPosition);
              setEnd(k.rightPosition);
            }}
            totalDuration={30000}
            trimmerLeftHandlePosition={start}
            trimmerRightHandlePosition={end}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderColor: '#F2994A',
    borderWidth: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
  },
  trimmer: {
    height: 64,
  },
  controllerButton: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
