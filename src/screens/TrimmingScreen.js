import React, {useState, useEffect} from 'react';
import {StyleSheet, View, TouchableOpacity, Platform} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Video from 'react-native-video';
import Trimmer from 'react-native-trimmer';
import {RNFFmpeg} from 'react-native-ffmpeg';

const RNFS = require('react-native-fs');

export default function TrimmingScreen(props) {
  const {route, navigation} = props;

  const [filename, setFilename] = useState(route.params.filename);
  const [player, setPlayer] = useState(320);
  const [currentTime, setCurrentTime] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [duration, setDuration] = useState(10000);
  const [isDuration, setIsDuration] = useState(true);
  const [width, setWidth] = useState(960);
  const [height, setHeight] = useState(180);
  const [pause, setPause] = useState(false);
  const cash = `${
    RNFS.TemporaryDirectoryPath
  }/${new Date().toISOString()}.mp4`.replace(/:/g, '-');
  let output;

  const handlePress = async () => {
    if (Platform.OS === 'ios') {
      await RNFS.copyAssetsFileIOS(route.params.filename, cash, 0, 0)
        .then(res => {})
        .catch(err => {
          console.log('ERROR: image file write failed!!!');
          console.log(err.message, err.code);
        });
    } else if (Platform.OS === 'android') {
      await RNFS.copyFile(route.params.filename, cash)
        .then(res => {})
        .catch(err => {
          console.log('ERROR: image file write failed!!!');
          console.log(err.message, err.code);
        });
    }

    output = `${
      RNFS.CachesDirectoryPath
    }/${new Date().toISOString()}.m4a`.replace(/:/g, '_');
    RNFFmpeg.execute(
      `-ss ${start / 1000} -i ${cash} -to ${
        end / 1000
      } -vn -acodec copy ${output}`,
    )
      .then(async result => {
        console.log(`FFmpeg process exited with rc=${result}.`);
      })
      .catch(err => {
        console.log(err.message, err.code);
      });

    setPause(true);
    setFilename(output);
    navigation.navigate('RecordEdit', {filename: output});
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handlePress}>
          <Icon name="chevron-right" size={36} />
        </TouchableOpacity>
      ),
    });
  });
  return (
    <View style={styles.container}>
      <View style={styles.display}>
        <TouchableOpacity
          style={styles.play}
          onPress={() => {
            if (pause) {
              setPause(false);
            } else {
              setPause(true);
            }
          }}>
          {pause && <Icon name="play" size={48} color="white" />}
          {!pause && <Icon name="pause" size={48} color="white" />}
        </TouchableOpacity>
        <Video
          source={{uri: filename}}
          ref={ref => {
            setPlayer(ref);
          }}
          paused={pause}
          onProgress={data => {
            if (data.currentTime * 1000 > end - 300) {
              player.seek(start / 1000);
            }
            setCurrentTime(data.currentTime * 1000);
          }}
          onLoad={data => {
            if (isDuration) {
              setDuration(data.duration * 1000);
              setIsDuration(false);
              setEnd(data.duration * 1000);
            }
            setWidth(data.naturalSize.width);
            setHeight(data.naturalSize.height);
          }}
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            width: width,
            height: height,
            maxHeight: '70%',
            maxWidth: '100%',
            alignSelf: 'center',
          }}
        />
      </View>
      <View style={styles.trimmer}>
        <Trimmer
          onHandleChange={v => {
            setStart(v.leftPosition);
            setEnd(v.rightPosition);
          }}
          initialZoomValue={8000 / duration}
          maxTrimDuration={30000}
          totalDuration={duration}
          trimmerLeftHandlePosition={start}
          trimmerRightHandlePosition={end}
          scrubberPosition={currentTime}
          onScrubbingComplete={position => {
            setCurrentTime(position);
            player.seek(position / 1000);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  play: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F2994A',
    padding: 12,
    zIndex: 10,
    position: 'absolute',
    bottom: '2%',
  },
  trimmer: {backgroundColor: 'white', transform: [{scaleY: 0.7}]},
  container: {flex: 1, backgroundColor: 'white'},
  display: {
    position: 'relative',
    alignItems: 'center',
    height: '80%',
    width: '100%',
    justifyContent: 'center',
  },
});
