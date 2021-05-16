import React, {useEffect} from 'react';

import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import PostButton from '../Icon/PostButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Recorder} from '@react-native-community/audio-toolkit';

export default function RecordCreateScreen(props) {
  const filename = 'test.mp4';
  const {navigation} = props;
  let recorder = new Recorder(filename, {
    bitrate: 256000,
    channels: 2,
    sampleRate: 44100,
    quality: 'max',
  });

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('RecordEdit', {filename});
          }}>
          <Icon name="chevron-right" size={36} />
        </TouchableOpacity>
      ),
    });
    reloadRecorder;
  });

  const reloadRecorder = () => {
    if (recorder) {
      recorder.destroy();
    }

    recorder = new Recorder(filename, {
      bitrate: 256000,
      channels: 2,
      sampleRate: 44100,
      quality: 'max',
    });
  };

  const toggleRecord = () => {
    let recordAudioRequest;
    if (Platform.OS === 'android') {
      recordAudioRequest = requestRecordAudioPermission();
    } else {
      recordAudioRequest = new Promise(function (resolve, reject) {
        resolve(true);
      });
    }

    recordAudioRequest.then(hasPermission => {
      if (!hasPermission) {
        Alert.alert('Record Audio Permission was denied');
        return;
      }

      recorder.toggleRecord((err, stopped) => {
        if (err) {
          Alert.alert(err.message);
        }
        if (stopped) {
          reloadRecorder();
        }
      });
    });
  };

  async function requestRecordAudioPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message:
            'ExampleApp needs access to your microphone to test react-native-audio-toolkit.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      console.log(granted);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.remixContainer}>
        <Text style={styles.remix}>リミックス</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonContainer} onPress={toggleRecord}>
        {!recorder.isRecording && <PostButton size={100} />}
        {recorder.isRecording && <PostButton size={100} color="red" />}
      </TouchableOpacity>
      <View style={styles.controller}>
        <TouchableOpacity style={styles.controllerButton}>
          <Icon name="music-note" size={48} color="black" />
          <Text style={styles.controllerText}>効果音</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controllerButton}>
          <Icon name="auto-fix" size={48} color="black" />
          <Text style={styles.controllerText}>エフェクト</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controllerButton}>
          <Icon name="pound" size={48} color="black" />
          <Text style={styles.controllerText}>タグ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  remixContainer: {
    marginTop: 32,
  },
  remix: {
    fontWeight: 'bold',
    fontSize: 18,
    height: 24,
  },
  container: {
    alignItems: 'center',
    position: 'relative',
    flex: 1,
    backgroundColor: 'white',
  },
  buttonContainer: {
    backgroundColor: '#F2994A',
    width: 152,
    height: 152,
    borderRadius: 76,
    alignSelf: 'center',
    zIndex: 8,
    position: 'absolute',
    top: 152,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 4,
    paddingBottom: 4,
  },
  controller: {
    paddingHorizontal: 36,
    position: 'absolute',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    bottom: 48,
  },
  controllerButton: {
    alignItems: 'center',
  },
  controllerText: {
    fontWeight: 'bold',
    fontSize: 18,
    height: 24,
    marginTop: 16,
  },
});
