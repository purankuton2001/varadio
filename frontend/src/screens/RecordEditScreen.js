/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useContext} from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  ScrollView,
  Platform,
  FlatList,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import Svg, {Path} from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {EditorContext} from '../../App';
import DocumentPicker from 'react-native-document-picker';
import PostButton from '../Icon/PostButton';

export default function RecordEditScreen(props) {
  const [timePass, setTimePass] = useState();
  const [currentTime, setCurrentTime] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(10);
  const {width} = Dimensions.get('window');
  const scrollWidth = width - 64;
  const {navigation} = props;
  const {editorState, editorDispatch} = useContext(EditorContext);
  const currentTimePan = new Animated.Value(
    (currentTime * scrollWidth) / editorState.duration,
  );
  const startPan = new Animated.Value(
    (start * scrollWidth) / editorState.duration,
  );
  const endPan = new Animated.Value((end * scrollWidth) / editorState.duration);
  const widthPan = new Animated.Value(
    ((end - start) * scrollWidth) / editorState.duration - 24,
  );
  const horizontalWidthPan = new Animated.Value(
    (scrollWidth * scrollWidth) /
      (((end - start) * scrollWidth) / editorState.duration) +
      24,
  );
  const horizontalWidth =
    (scrollWidth * editorState.duration) / (end - start) + 12;

  const currentTimepanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e, gestureState) => {
      currentTimePan.setOffset(
        (currentTime * scrollWidth) / editorState.duration,
      );
      currentTimePan.setValue(0);
    },
    onPanResponderMove: (e, gestureState) => {
      const newCurrentTimePan =
        (currentTime * scrollWidth) / editorState.duration + gestureState.dx;
      const newCurrentTimeState =
        currentTime + (gestureState.dx * editorState.duration) / scrollWidth;
      if (newCurrentTimeState > end) {
        endPan.setValue(
          newCurrentTimeState > editorState.duration
            ? scrollWidth
            : newCurrentTimePan,
        );
        startPan.setValue(
          newCurrentTimeState > editorState.duration
            ? ((start + editorState.duration - end) * scrollWidth) /
                editorState.duration
            : ((newCurrentTimeState - end - start) * scrollWidth) /
                editorState.duration,
        );
        setStart(
          newCurrentTimeState > editorState.duration
            ? start + editorState.duration - end
            : newCurrentTimeState - end + start,
        );
        setEnd(
          newCurrentTimeState > editorState.duration
            ? editorState.duration
            : newCurrentTimeState,
        );
      }
      if (newCurrentTimeState < start) {
        startPan.setValue(newCurrentTimeState < 0 ? 0 : newCurrentTimePan);
        endPan.setValue(
          newCurrentTimeState < 0
            ? ((end - start) * scrollWidth) / editorState.duration
            : ((newCurrentTimeState + end - start) * scrollWidth) /
                editorState.duration,
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
        if (newCurrentTimeState > editorState.duration) {
          currentTimePan.setValue(scrollWidth);
          setCurrentTime(editorState.duration);
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
  const horizontalCurrentTimepanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e, gestureState) => {
      currentTimePan.setOffset(
        (currentTime * scrollWidth) / editorState.duration,
      );
      currentTimePan.setValue(0);
    },
    onPanResponderMove: (e, gestureState) => {
      const newCurrentTimePan =
        (currentTime * horizontalWidth) / editorState.duration +
        gestureState.dx;
      const newCurrentTimeState =
        currentTime +
        (gestureState.dx * editorState.duration) / horizontalWidth;
      if (
        newCurrentTimePan + 24 >
          (end * horizontalWidth) / editorState.duration &&
        gestureState.dx >= 0
      ) {
        currentTimePan.setValue(
          newCurrentTimePan > horizontalWidth - 24
            ? scrollWidth
            : newCurrentTimePan + (24 * scrollWidth) / horizontalWidth,
        );
        startPan.setValue(
          newCurrentTimePan > horizontalWidth - 24
            ? scrollWidth - ((end - start) * scrollWidth) / editorState.duration
            : (start * scrollWidth) / editorState.duration +
                (24 * scrollWidth) / horizontalWidth,
        );
        endPan.setValue(
          newCurrentTimePan > horizontalWidth - 24
            ? scrollWidth
            : (end * scrollWidth) / editorState.duration +
                (24 * scrollWidth) / horizontalWidth,
        );
        setStart(
          newCurrentTimePan > horizontalWidth - 24
            ? editorState.duration - (end - start)
            : start + (24 * editorState.duration) / horizontalWidth,
        );
        setEnd(
          newCurrentTimePan > horizontalWidth - 24
            ? editorState.duration
            : end + (24 * editorState.duration) / horizontalWidth,
        );
        setCurrentTime(
          newCurrentTimePan > horizontalWidth - 24
            ? editorState.duration
            : newCurrentTimeState +
                (24 * editorState.duration) / horizontalWidth,
        );
      } else {
        if (
          newCurrentTimePan - 24 <
            (start * horizontalWidth) / editorState.duration &&
          gestureState.dx <= 0
        ) {
          currentTimePan.setValue(
            newCurrentTimePan < 24
              ? 0
              : ((newCurrentTimePan - 24) * scrollWidth) / horizontalWidth,
          );
          startPan.setValue(
            newCurrentTimePan < 24
              ? 0
              : (start * scrollWidth) / editorState.duration -
                  (24 * scrollWidth) / horizontalWidth,
          );
          endPan.setValue(
            newCurrentTimePan < 24
              ? ((end - start) * scrollWidth) / editorState.duration
              : (end * scrollWidth) / editorState.duration -
                  (24 * scrollWidth) / horizontalWidth,
          );
          setEnd(
            newCurrentTimePan < 24
              ? end - start
              : end - (24 * editorState.duration) / horizontalWidth,
          );
          setStart(
            newCurrentTimePan < 24
              ? 0
              : start - (24 * editorState.duration) / horizontalWidth,
          );
          setCurrentTime(
            newCurrentTimePan < 24
              ? 0
              : newCurrentTimeState -
                  (24 * editorState.duration) / horizontalWidth,
          );
        } else {
          if (newCurrentTimePan < 0) {
            currentTimePan.setValue(0);
            setCurrentTime(0);
          } else {
            if (newCurrentTimeState > editorState.duration) {
              currentTimePan.setValue(scrollWidth);
              setCurrentTime(editorState.duration);
            } else {
              currentTimePan.setValue(
                (newCurrentTimePan * scrollWidth) / horizontalWidth,
              );
              setCurrentTime(newCurrentTimeState);
            }
          }
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
      startPan.setOffset((start * scrollWidth) / editorState.duration);
      endPan.setOffset((end * scrollWidth) / editorState.duration);
      startPan.setValue(0);
      endPan.setValue(0);
    },
    onPanResponderMove: (e, gestureState) => {
      const newStartPan =
        (start * scrollWidth) / editorState.duration + gestureState.dx;
      const newStartState =
        start + (gestureState.dx * editorState.duration) / scrollWidth;

      const newEndPan =
        (end * scrollWidth) / editorState.duration + gestureState.dx;
      const newEndState =
        end + (gestureState.dx * editorState.duration) / scrollWidth;

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
        endPan.setValue(((end - start) * scrollWidth) / editorState.duration);
        setEnd(end - start);
      } else {
        if (newEndState > editorState.duration) {
          endPan.setValue(scrollWidth);
          setEnd(editorState.duration);
          startPan.setValue(
            scrollWidth - ((end - start) * scrollWidth) / editorState.duration,
          );
          setStart(editorState.duration - (end - start));
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
      startPan.setOffset((start * scrollWidth) / editorState.duration);
      startPan.setValue(0);
    },
    onPanResponderMove: (e, gestureState) => {
      const newStartPan =
        (start * scrollWidth) / editorState.duration + gestureState.dx;
      const newStartState =
        start + (gestureState.dx * editorState.duration) / scrollWidth;

      if ((end * scrollWidth) / editorState.duration - 24 < newStartPan) {
        endPan.setValue(
          newStartPan > scrollWidth - 24 ? scrollWidth : newStartPan + 24,
        );
        setEnd(
          newStartPan > scrollWidth - 24
            ? editorState.duration
            : ((newStartPan + 24) * editorState.duration) / scrollWidth,
        );
      }

      if (newStartState > currentTime) {
        currentTimePan.setValue(
          newStartState > editorState.duration ? scrollWidth : newStartPan,
        );
        setCurrentTime(
          newStartState > editorState.duration
            ? editorState.duration
            : newStartState,
        );
      }
      if (newStartState < 0) {
        startPan.setValue(0);
        setStart(0);
      } else {
        if (newStartPan > scrollWidth - 24) {
          startPan.setValue(scrollWidth - 24);
          setStart(((scrollWidth - 24) * editorState.duration) / scrollWidth);
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
      endPan.setOffset((end * scrollWidth) / editorState.duration);
      endPan.setValue(0);
    },

    onPanResponderMove: (e, gestureState) => {
      const newEndPan =
        (end * scrollWidth) / editorState.duration + gestureState.dx;
      const newEndState =
        end + (gestureState.dx * editorState.duration) / scrollWidth;

      if (newEndPan - 24 < (start * scrollWidth) / editorState.duration) {
        startPan.setValue(newEndPan < 24 ? 0 : newEndPan - 24);
        setStart(
          newEndPan < 24
            ? 0
            : ((newEndPan - 24) * editorState.duration) / scrollWidth,
        );
      }
      if (newEndState < currentTime) {
        currentTimePan.setValue(newEndState < 0 ? 0 : newEndPan);
        setCurrentTime(newEndState < 0 ? 0 : newEndState);
      }
      if (newEndPan < 24) {
        endPan.setValue(24);
        setEnd((24 * editorState.duration) / scrollWidth);
      } else {
        if (newEndState > editorState.duration) {
          endPan.setValue(scrollWidth);
          setEnd(editorState.duration);
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
  const options = {
    type: [
      DocumentPicker.types.audio,
      Platform.OS === 'ios' ? 'com.apple.quicktime-movie' : 'video/mp4',
    ],
  };
  const handlePress = () => {
    navigation.navigate('RecordPost');
  };
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handlePress}>
          <Icon name="chevron-right" size={36} />
        </TouchableOpacity>
      ),
    });
    return clearInterval(timePass);
  }, []);
  let RecordsPanResponer = [];
  let RecordsPan = [];
  const [RecordsRef, setRecordsRef] = useState([]);
  const [RecordsPaused, setRecordsPaused] = useState([]);
  let RecordsWidthPan = [];

  function renderItem({item}) {
    RecordsPan[item.id] = new Animated.Value(
      (editorState.records[item.id].start * horizontalWidth) /
        editorState.duration,
    );
    RecordsWidthPan[item.id] = new Animated.Value(
      ((item.trimEnd - item.trimStart) * horizontalWidth) /
        editorState.duration,
    );
    RecordsPanResponer[item.id] = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e, gestureState) => {},

      onPanResponderMove: (e, gestureState) => {
        const newPan =
          (editorState.records[item.id].start * horizontalWidth) /
            editorState.duration +
          gestureState.dx;
        const newState =
          editorState.records[item.id].start +
          (gestureState.dx * editorState.duration) / horizontalWidth;

        if (
          newPan +
            ((item.trimEnd - item.trimStart) * horizontalWidth) /
              editorState.duration +
            24 >
            (end * horizontalWidth) / editorState.duration &&
          gestureState.dx >= 0
        ) {
          const newStartState =
            newPan +
              ((item.trimEnd - item.trimStart) * horizontalWidth) /
                editorState.duration +
              24 >
            horizontalWidth
              ? editorState.duration - (end - start)
              : start + (24 * editorState.duration) / horizontalWidth;
          const newEndState =
            newPan +
              ((item.trimEnd - item.trimStart) * horizontalWidth) /
                editorState.duration +
              24 >
            horizontalWidth
              ? editorState.duration
              : end + (24 * editorState.duration) / horizontalWidth;

          RecordsPan[item.id].setValue(
            newPan +
              ((item.trimEnd - item.trimStart) * horizontalWidth) /
                editorState.duration +
              24 >
              horizontalWidth
              ? horizontalWidth -
                  ((item.trimEnd - item.trimStart) * horizontalWidth) /
                    editorState.duration
              : newPan + 24,
          );
          startPan.setValue(
            newPan +
              ((item.trimEnd - item.trimStart) * horizontalWidth) /
                editorState.duration +
              24 >
              horizontalWidth
              ? scrollWidth -
                  ((end - start) * scrollWidth) / editorState.duration
              : (start * scrollWidth) / editorState.duration +
                  (24 * scrollWidth) / horizontalWidth,
          );
          endPan.setValue(
            newPan +
              ((item.trimEnd - item.trimStart) * horizontalWidth) /
                editorState.duration +
              24 >
              horizontalWidth
              ? scrollWidth
              : (end * scrollWidth) / editorState.duration +
                  (24 * scrollWidth) / horizontalWidth,
          );
          setStart(newStartState);
          setEnd(newEndState);
          editorDispatch({
            type: 'SEEKRECORDS',
            value:
              newPan +
                ((item.trimEnd - item.trimStart) * horizontalWidth) /
                  editorState.duration +
                24 >
              horizontalWidth
                ? editorState.duration - (item.trimEnd - item.trimStart)
                : newState + (24 * editorState.duration) / horizontalWidth,
            id: item.id,
          });
          gestureState.dx = 0;
          if (newStartState > currentTime) {
            currentTimePan.setValue(
              (newStartState * scrollWidth) / editorState.duration,
            );
            setCurrentTime(newStartState);
          }

          if (newEndState < currentTime) {
            currentTimePan.setValue(
              (newEndState * scrollWidth) / editorState.duration,
            );
            setCurrentTime(newEndState);
          }
        } else {
          gestureState.dx = 0;
          if (
            newPan - 24 < (start * horizontalWidth) / editorState.duration &&
            gestureState.dx <= 0
          ) {
            const newStartState =
              newPan < 24
                ? 0
                : start - (24 * editorState.duration) / horizontalWidth;
            const newEndState =
              newPan < 24
                ? end - start
                : end - (24 * editorState.duration) / horizontalWidth;

            RecordsPan[item.id].setValue(newPan < 24 ? 0 : newPan - 24);
            startPan.setValue(
              newPan < 24
                ? 0
                : (start * scrollWidth) / editorState.duration -
                    (24 * scrollWidth) / horizontalWidth,
            );
            endPan.setValue(
              newPan < 24
                ? ((end - start) * scrollWidth) / editorState.duration
                : (end * scrollWidth) / editorState.duration -
                    (24 * scrollWidth) / horizontalWidth,
            );
            setEnd(newEndState);
            setStart(newStartState);
            editorDispatch({
              type: 'SEEKRECORDS',
              value:
                newPan < 24
                  ? 0
                  : newState - (24 * editorState.duration) / horizontalWidth,
              id: item.id,
            });
            if (newStartState > currentTime) {
              currentTimePan.setValue(
                (newStartState * scrollWidth) / editorState.duration,
              );
              setCurrentTime(newStartState);
            }

            if (newEndState < currentTime) {
              currentTimePan.setValue(
                (newEndState * scrollWidth) / editorState.duration,
              );
              setCurrentTime(newEndState);
            }
          } else {
            if (newPan < 0) {
              RecordsPan[item.id].setValue(0);
              editorDispatch({
                type: 'SEEKRECORDS',
                value: 0,
                id: item.id,
              });
            } else {
              if (
                newPan >
                horizontalWidth -
                  ((item.trimEnd - item.trimStart) * horizontalWidth) /
                    editorState.duration
              ) {
                RecordsPan[item.id].setValue(
                  ((editorState.duration - item.trimEnd + item.trimStart) *
                    horizontalWidth) /
                    editorState.duration,
                );
                editorDispatch({
                  type: 'SEEKRECORDS',
                  value: editorState.duration - (item.trimEnd - item.trimStart),
                  id: item.id,
                });
              } else {
                RecordsPan[item.id].setValue(newPan);
                editorDispatch({
                  type: 'SEEKRECORDS',
                  value: newState,
                  id: item.id,
                });
              }
            }
          }
        }
      },

      onPanResponderRelease: () => {
        RecordsPan[item.id].flattenOffset();
      },
    });

    return (
      <View>
        <Video
          source={{uri: item.url}}
          ref={ref => {
            RecordsRef[item.id] = ref;
          }}
          paused={RecordsPaused[item.id]}
          onLoad={data => {
            setRecordsPaused([...RecordsPaused, true]);
          }}
          onProgress={data => {
            if (currentTime + 0.1 >= item.end) {
              const newPaused = RecordsPaused;
              newPaused[item.id] = true;
              setRecordsPaused(newPaused);
            }
          }}
          audioOnly
        />
        <Animated.View
          style={[styles.recordContainer, {width: horizontalWidthPan}]}>
          <Animated.View
            style={[
              styles.recordItem,
              {
                width: RecordsWidthPan[item.id],
                transform: [{translateX: RecordsPan[item.id]}],
              },
            ]}
            {...RecordsPanResponer[item.id].panHandlers}>
            <Icon name="play" size={48} color="#F2994A" />
          </Animated.View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>{currentTime}</Text>
      <View style={styles.displayRange}>
        <View
          style={{
            transform: [
              {translateX: (currentTime * scrollWidth) / editorState.duration},
            ],
          }}>
          <Animated.View {...currentTimepanResponder.panHandlers}>
            <Svg
              width="24"
              height="27"
              viewBox="0 0 14 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <Path d="M1 0H13V8.98877H1V0Z" fill="#F2994A" />
              <Path d="M7 17L0.937822 8.75L13.0622 8.75L7 17Z" fill="#F2994A" />
            </Svg>
          </Animated.View>
        </View>

        <View style={styles.rangeSider}>
          <Animated.View
            style={[styles.leftSide, {transform: [{translateX: startPan}]}]}
            {...startPanResponder.panHandlers}
          />
          <Animated.View
            style={[
              styles.slider,
              {
                width: widthPan,
                transform: [{translateX: startPan}],
              },
            ]}
            {...centerPanResponder.panHandlers}
          />

          <Animated.View
            style={[styles.rightSide, {transform: [{translateX: endPan}]}]}
            {...endPanResponder.panHandlers}
          />
        </View>
      </View>
      <TouchableOpacity
        style={styles.play}
        onPress={() => {
          if (!timePass) {
            let time = currentTime;
            const timepass = setInterval(() => {
              time = time > editorState.duration ? 0 : time + 0.1;
              editorState.records.forEach(record => {
                if (
                  record.start <= time &&
                  time <= record.end &&
                  RecordsPaused[record.id]
                ) {
                  RecordsRef[record.id].seek(time - record.start);
                  const newPaused = RecordsPaused;
                  newPaused[record.id] = false;
                  setRecordsPaused(newPaused);
                }
              });
              setCurrentTime(time);
            }, 100);

            setTimePass(timepass);
          } else {
            editorState.records.forEach(record => {
              if (!RecordsPaused[record.id]) {
                const newPaused = RecordsPaused;
                newPaused[record.id] = true;
                setRecordsPaused(newPaused);
              }
            });
            clearInterval(timePass);
            setTimePass(false);
          }
        }}>
        {timePass ? (
          <Icon name="pause" size={48} color="white" />
        ) : (
          <Icon name="play" size={48} color="white" />
        )}
      </TouchableOpacity>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        contentOffset={{
          x: (start * horizontalWidth) / editorState.duration,
          y: 0,
        }}>
        <View style={styles.scrollHorizontal}>
          <View style={styles.editContainer}>
            <View
              style={[
                styles.scrubberthumb,
                {
                  transform: [
                    {
                      translateX:
                        (currentTime * horizontalWidth) / editorState.duration,
                    },
                  ],
                },
              ]}
              {...horizontalCurrentTimepanResponder.panHandlers}>
              <Svg
                width="20"
                height="24"
                viewBox="0 0 14 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <Path d="M1 0H13V8.98877H1V0Z" fill="#F2994A" />
                <Path
                  d="M7 17L0.937822 8.75L13.0622 8.75L7 17Z"
                  fill="#F2994A"
                />
              </Svg>
            </View>

            <View
              style={[
                styles.scrubber,
                {
                  transform: [
                    {
                      translateX:
                        (currentTime * horizontalWidth) / editorState.duration,
                    },
                  ],
                },
              ]}
            />
            <View style={styles.seekBar} />
            <FlatList
              data={editorState.records}
              renderItem={renderItem}
              keyExtractor={item => item.id}
            />
          </View>
        </View>
      </ScrollView>
      <View style={styles.recordsAdd}>
        <TouchableOpacity>
          <Icon name="music" size={32} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonContainer} onPress={() => {}}>
          <PostButton size={64} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
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
          <Icon name="folder" size={32} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    paddingHorizontal: 20,
  },
  time: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
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
  play: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F2994A',
    padding: 12,
    alignSelf: 'center',
    marginVertical: 16,
  },
  scrubberthumb: {
    top: 0,
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  scrubber: {
    top: 0,
    left: 9,
    position: 'absolute',
    width: 2,
    height: '100%',
    backgroundColor: '#F2994A',
    alignItems: 'center',
    zIndex: 10,
  },
  editContainer: {
    position: 'relative',
    paddingTop: 7,
  },
  recordContainer: {
    borderWidth: 0.5,
    borderColor: '#A7A7A7',
    height: 72,
    padding: 4,
    marginVertical: 8,
  },
  recordItem: {
    width: '100%',
    height: '100%',
    borderWidth: 1,
    borderColor: '#F2994A',
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonContainer: {
    backgroundColor: '#F2994A',
    width: 88,
    height: 88,
    borderRadius: 44,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 4,
    paddingBottom: 4,
    marginHorizontal: 32,
  },
  recordsAdd: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 32,
  },
});
