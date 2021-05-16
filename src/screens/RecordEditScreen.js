import React, {useState, useEffect} from 'react';
import {TouchableOpacity, View, StyleSheet, Text, Alert} from 'react-native';
import {WebView} from 'react-native-webview';
import {Slider} from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function RecordEditScreen(props) {
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('RecordPost', {
              filename,
            });
          }}>
          <Icon name="chevron-right" size={36} />
        </TouchableOpacity>
      ),
    });
  });
  const {navigation, route} = props;
  const [time, setTime] = useState();
  const [filename, setFilename] = useState(route.params.filename);
  const [ref, setRef] = useState();
  const run = `
    player.start();
    true;
  `;
  const slide = `
    player.start(0,${time});
    true;
  `;

  const html = `<!DOCTYPE html>
  <html lang="en">

  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>音声を編集する</title>

  </head>

  <body>
      <script src="https://tonejs.github.io/build/Tone.js"></script>
      <script>
      const player = new Tone.Player(${route.params.filename}).toDestination();
      </script>
  </body>

  </html>`;
  const handlePress = () => {
    ref.injectJavaScript(run);
    Alert.alert(route.params.filename);
  };
  function handleSlide(value) {
    setTime(value);
    ref.injectJavaScript(slide);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.play} onPress={handlePress}>
        <Icon name="play" size={48} color="white" />
      </TouchableOpacity>
      <Slider
        value={time}
        onValueChange={handleSlide}
        style={styles.slider}
        thumbStyle={{width: 16, height: 16}}
        thumbTintColor="#F2994A"
        thumbTouchSize={{width: 16, height: 16}}
        maximumValue={30}
        trackStyle={{backgroundColor: '#F2994A'}}
      />
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
      <WebView
        source={{html: html}}
        ref={setRef}
        onMessage={ev => console.log(ev.nativeEvent.data)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  webView: {
    height: 0,
    width: 0,
  },
  play: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F2994A',
    padding: 12,
    alignSelf: 'center',
    marginBottom: 32,
  },
  slider: {
    width: 220,
    alignSelf: 'center',
  },
  controller: {
    zIndex: 4,
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
