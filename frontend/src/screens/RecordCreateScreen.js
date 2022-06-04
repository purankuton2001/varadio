/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useContext} from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
  Alert,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DocumentPicker from 'react-native-document-picker';
import PostButton from '../Icon/PostButton';
import AudioRecord from 'react-native-audio-record';
import Permissions, {PERMISSIONS} from 'react-native-permissions';
import {Modal} from 'react-native-paper';
import {Overlay} from 'react-native-elements';

export default function RecordCreateScreen(props) {
  const recordOptions = {
    sampleRate: 16000, // default 44100
    channels: 1, // 1 or 2, default 1
    bitsPerSample: 16, // 8 or 16, default 16
    audioSource: 6, // android only (see below)
    wavFile: 'audio.wav', // default 'audio.wav'
  };

  useEffect(() => {
    checkPermission().then(() => {
      AudioRecord.init(recordOptions);
    });
    return () => {
      if (recording) AudioRecord.stop();
    };
  }, []);

  checkPermission = async () => {
    const p = await Permissions.check(PERMISSIONS.ANDROID.RECORD_AUDIO);
    console.log('permission check', p);
    if (p === 'authorized') return;
    return this.requestPermission();
  };

  requestPermission = async () => {
    const p = await Permissions.request(PERMISSIONS.ANDROID.RECORD_AUDIO);
    console.log('permission request', p);
  };

  const [shortest, setShortest] = useState(true);
  const [recording, setRecording] = useState(false);
  const {navigation} = props;

  const pressRecord = async () => {
    if (!recording) {
      setShortest(true);
      AudioRecord.start();
      setTimeout(() => {
        setShortest(false);
      }, 5000);
    } else {
      if (shortest) {
        Alert.alert('録音が短すぎます！');
        AudioRecord.stop();
      } else {
        const filename = await AudioRecord.stop();
        navigation.navigate('Trimming', {filename, isVideo: false});
      }
    }
    setRecording(!recording);
  };
  const options = {
    type: [
      DocumentPicker.types.audio,
      Platform.OS === 'ios' ? 'com.apple.quicktime-movie' : 'video/mp4',
    ],
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.fileContainer}
        onPress={async () => {
          if (recording) AudioRecord.stop();
          setRecording(false);
          const response = await DocumentPicker.pick(options);
          try {
            console.log('Response = ', response);
            const extension = await response[0].uri.match(/[^.]+$/);
            console.log(extension);
            const isVideo = response[0].type.indexOf('audio') === -1;
            navigation.navigate('Trimming', {
              filename: response[0].uri,
              isVideo,
              extension,
            });
          } catch (error) {
            if (!DocumentPicker.isCancel(error)) {
              throw error;
            }
          }
        }}>
        <Text style={styles.fileText}>ファイルを読み込み</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonContainer} onPress={pressRecord}>
        <PostButton size={96} color={recording ? 'red' : 'white'} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'white',
    flex: 1,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    marginVertical: 144,
    backgroundColor: '#F2994A',
    width: 120,
    height: 120,
    borderRadius: 60,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 4,
    paddingBottom: 4,
  },
  fileContainer: {
    marginVertical: 64,
  },
  fileText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
