import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  PanResponder,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Video from 'react-native-video';
import Svg, {Path} from 'react-native-svg';
// import {RNFFmpeg} from 'react-native-ffmpeg';
import {RNFFmpeg} from 'react-native-ffmpeg';

// const RNFS = require('react-native-fs');

export default function TrimmingScreen(props) {
  const {route, navigation} = props;
  const {isVideo, filename} = route.params;
  const [player, setPlayer] = useState(320);
  const [currentTime, setCurrentTime] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [duration, setDuration] = useState(10);
  const [isDuration, setIsDuration] = useState(true);
  const [width, setWidth] = useState(960);
  const [height, setHeight] = useState(180);
  const [pause, setPause] = useState(false);
  const cash = `${
    RNFS.TemporaryDirectoryPath
  }/${new Date().toISOString()}`.replace(/:/g, '-');
  let output;
  const currentTimePan = new Animated.Value(
    (currentTime * scrollWidth) / duration,
  );

  const startPan = new Animated.Value((start * scrollWidth) / duration);
  const endPan = new Animated.Value((end * scrollWidth) / duration);
  const dimensions = Dimensions.get('window');
  const windowWidth = dimensions.width;
  const scrollWidth = windowWidth - 64;

  const currentTimepanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e, gestureState) => {
      currentTimePan.setOffset((currentTime * scrollWidth) / duration);
      currentTimePan.setValue(0);
    },
    onPanResponderMove: (e, gestureState) => {
      const newCurrentTimePan =
        (currentTime * scrollWidth) / duration + gestureState.dx;
      const newCurrentTimeState =
        currentTime + (gestureState.dx * duration) / scrollWidth;
      if (newCurrentTimeState > end) {
        endPan.setValue(
          newCurrentTimeState > duration ? scrollWidth : newCurrentTimePan,
        );
        startPan.setValue(
          newCurrentTimeState > duration
            ? ((start + duration - end) * scrollWidth) / duration
            : ((newCurrentTimeState - end - start) * scrollWidth) / duration,
        );
        setStart(
          newCurrentTimeState > duration
            ? start + duration - end
            : newCurrentTimeState - end + start,
        );
        setEnd(newCurrentTimeState > duration ? duration : newCurrentTimeState);
      }
      if (newCurrentTimeState < start) {
        startPan.setValue(newCurrentTimeState < 0 ? 0 : newCurrentTimePan);
        endPan.setValue(
          newCurrentTimeState < 0
            ? ((end - start) * scrollWidth) / duration
            : ((newCurrentTimeState + end - start) * scrollWidth) / duration,
        );
        setEnd(
          newCurrentTimeState < 0
            ? end - start
            : newCurrentTimeState + end - start,
        );
        setStart(newCurrentTimeState < 0 ? 0 : newCurrentTimeState);
      }

      if (newCurrentTimeState < 0) {
        currentTimePan.setValue(0);
        setCurrentTime(0);
      } else {
        if (newCurrentTimeState > duration) {
          currentTimePan.setValue(scrollWidth);
          setCurrentTime(duration);
        } else {
          currentTimePan.setValue(newCurrentTimePan);
          setCurrentTime(newCurrentTimeState);
        }
      }
    },
    onPanResponderRelease: () => {
      currentTimePan.flattenOffset();
      console.log(scrollWidth);
    },
  });

  const centerPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e, gestureState) => {
      startPan.setOffset((start * scrollWidth) / duration);
      endPan.setOffset((end * scrollWidth) / duration);
      startPan.setValue(0);
      endPan.setValue(0);
    },
    onPanResponderMove: (e, gestureState) => {
      const newStartPan = (start * scrollWidth) / duration + gestureState.dx;
      const newStartState = start + (gestureState.dx * duration) / scrollWidth;

      const newEndPan = (end * scrollWidth) / duration + gestureState.dx;
      const newEndState = end + (gestureState.dx * duration) / scrollWidth;

      if (newStartState > currentTime) {
        currentTimePan.setValue(newStartPan);
        setCurrentTime(newStartState);
      }

      if (newEndState < currentTime) {
        currentTimePan.setValue(newEndPan);
        setCurrentTime(newEndState);
      }

      if (newStartState < 0) {
        startPan.setValue(0);
        setStart(0);
        endPan.setValue(((end - start) * scrollWidth) / duration);
        setEnd(end - start);
      } else {
        if (newEndState > duration) {
          endPan.setValue(scrollWidth);
          setEnd(duration);
          startPan.setValue(
            scrollWidth - ((end - start) * scrollWidth) / duration,
          );
          setStart(duration - (end - start));
        } else {
          startPan.setValue(newStartPan);
          setStart(newStartState);
          endPan.setValue(newEndPan);
          setEnd(newEndState);
        }
      }
    },

    onPanResponderRelease: () => {
      startPan.flattenOffset();
      endPan.flattenOffset();
    },
  });
  const startPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e, gestureState) => {
      startPan.setOffset((start * scrollWidth) / duration);
      startPan.setValue(0);
    },
    onPanResponderMove: (e, gestureState) => {
      const newStartPan = (start * scrollWidth) / duration + gestureState.dx;
      const newStartState = start + (gestureState.dx * duration) / scrollWidth;

      if ((end * scrollWidth) / duration - 24 < newStartPan) {
        endPan.setValue(
          newStartPan > scrollWidth - 24 ? scrollWidth : newStartPan + 24,
        );
        setEnd(
          newStartPan > scrollWidth - 24
            ? duration
            : ((newStartPan + 24) * duration) / scrollWidth,
        );
      }

      if (end - newStartState > 30) {
        endPan.setValue(((newStartState + 30) * scrollWidth) / duration);
        setEnd(newStartState + 30);
        if (newStartState + 30 < currentTime) {
          currentTimePan.setValue(
            ((newStartState + 30) * scrollWidth) / duration,
          );
          setCurrentTime(newStartState + 30);
        }
      }

      if (newStartState > currentTime) {
        currentTimePan.setValue(
          newStartState > duration ? scrollWidth : newStartPan,
        );
        setCurrentTime(newStartState > duration ? duration : newStartState);
      }
      if (newStartState < 0) {
        startPan.setValue(0);
        setStart(0);
      } else {
        if (newStartPan > scrollWidth - 24) {
          startPan.setValue(scrollWidth - 24);
          setStart(((scrollWidth - 24) * duration) / scrollWidth);
        } else {
          startPan.setValue(newStartPan);
          setStart(newStartState);
        }
      }
    },
    onPanResponderRelease: () => {
      startPan.flattenOffset();
      endPan.flattenOffset();
    },
  });
  const endPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e, gestureState) => {
      endPan.setOffset((end * scrollWidth) / duration);
      endPan.setValue(0);
    },

    onPanResponderMove: (e, gestureState) => {
      const newEndPan = (end * scrollWidth) / duration + gestureState.dx;
      const newEndState = end + (gestureState.dx * duration) / scrollWidth;

      if (newEndPan - 24 < (start * scrollWidth) / duration) {
        startPan.setValue(newEndPan < 24 ? 0 : newEndPan - 24);
        setStart(
          newEndPan < 24 ? 0 : ((newEndPan - 24) * duration) / scrollWidth,
        );
      }
      if (newEndState - start > 30) {
        startPan.setValue(((newEndState - 30) * scrollWidth) / duration);
        setStart(newEndState - 30);
        if (newEndState - 30 > currentTime) {
          currentTimePan.setValue(
            ((newEndState - 30) * scrollWidth) / duration,
          );
          setCurrentTime(newEndState - 30);
        }
      }
      if (newEndState < currentTime) {
        currentTimePan.setValue(newEndState < 0 ? 0 : newEndPan);
        setCurrentTime(newEndState < 0 ? 0 : newEndState);
      }
      if (newEndPan < 24) {
        endPan.setValue(24);
        setEnd((24 * duration) / scrollWidth);
      } else {
        if (newEndState > duration) {
          endPan.setValue(scrollWidth);
          setEnd(duration);
        } else {
          endPan.setValue(newEndPan);
          setEnd(newEndState);
        }
      }
    },

    onPanResponderRelease: () => {
      endPan.flattenOffset();
    },
  });

  const handlePress = async () => {
    if (Platform.OS === 'ios') {
      await RNFS.copyAssetsFileIOS(filename, cash, 0, 0)
        .then(res => {})
        .catch(err => {
          console.log('ERROR: image file write failed!!!');
          console.log(err.message, err.code);
        });
    } else if (Platform.OS === 'android') {
      await RNFS.copyFile(filename, cash)
        .then(res => {})
        .catch(err => {
          console.log('ERROR: image file write failed!!!');
          console.log(err.message, err.code);
        });
    }
    if (isVideo) {
      output = `${
        RNFS.CachesDirectoryPath
      }/${new Date().toISOString()}.m4a`.replace(/:/g, '_');
      RNFFmpeg.execute(
        `-ss ${start} -i ${cash} -to ${end} -vn -acodec copy ${output}`,
      )
        .then(async result => {
          console.log(`FFmpeg process exited with rc=${result}.`);
          navigation.navigate('RecordAdd', {output, start, end});
        })
        .catch(err => {
          console.log(err.message, err.code);
        });
    } else {
      output = `${
        RNFS.CachesDirectoryPath
      }/${new Date().toISOString()}.mp3`.replace(/:/g, '_');
      RNFFmpeg.execute(`-ss ${start} -i ${cash} -to ${end} ${output}`)
        .then(async result => {
          console.log(`FFmpeg process exited with rc=${result}.`);
          navigation.navigate('RecordAdd', {output, start, end});
        })
        .catch(err => {
          console.log(err.message, err.code);
        });
    }

    setPause(true);
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
            if (data.currentTime > end - 3) {
              player.seek(start);
            }
            setCurrentTime(data.currentTime);
          }}
          onLoad={data => {
            if (isDuration) {
              setDuration(data.duration);
              setIsDuration(false);
              setEnd(data.duration > 30 ? 30 : data.duration);
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
      <View style={styles.displayRange}>
        <View
          style={{
            transform: [
              {
                translateX: (currentTime * scrollWidth) / duration,
              },
            ],
          }}>
          <View {...currentTimepanResponder.panHandlers}>
            <Svg
              width="24"
              height="27"
              viewBox="0 0 14 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <Path d="M1 0H13V8.98877H1V0Z" fill="#F2994A" />
              <Path d="M7 17L0.937822 8.75L13.0622 8.75L7 17Z" fill="#F2994A" />
            </Svg>
          </View>
        </View>

        <View style={styles.rangeSider}>
          <View
            style={[
              styles.leftSide,
              {transform: [{translateX: (start * scrollWidth) / duration}]},
            ]}
            {...startPanResponder.panHandlers}
          />
          <View
            style={[
              styles.slider,
              {
                width: ((end - start) * scrollWidth) / duration - 24,
                transform: [{translateX: (start * scrollWidth) / duration}],
              },
            ]}
            {...centerPanResponder.panHandlers}
          />

          <View
            style={[
              styles.rightSide,
              {transform: [{translateX: (end * scrollWidth) / duration}]},
            ]}
            {...endPanResponder.panHandlers}
          />
        </View>
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
  container: {flex: 1, backgroundColor: 'white', paddingHorizontal: 20},
  display: {
    position: 'relative',
    alignItems: 'center',
    height: '80%',
    width: '100%',
    justifyContent: 'center',
  },
  rangeSider: {
    position: 'relative',
    height: 24,
    backgroundColor: '#F5F5F5',
    flexDirection: 'row',
  },
  leftSide: {
    position: 'absolute',
    backgroundColor: '#F2994A',
    width: 24,
    height: 24,
    left: 0,
    borderRadius: 12,
  },
  rightSide: {
    position: 'absolute',
    backgroundColor: '#F2994A',
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  seekBar: {
    height: 8,
    backgroundColor: '#F5F5F5',
    marginBottom: 8,
    width: '100%',
  },
  slider: {
    left: 24,
    backgroundColor: '#C4C4C4',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
