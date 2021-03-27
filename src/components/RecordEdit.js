import React, {useState} from 'react';
import {TouchableOpacity, View, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';
import Trimmer from 'react-native-trimmer';
export default function RecordEdit() {
  const [ref, setRef] = useState();
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(10000);
    const setup = `
    const player = new Tone.Player('husigityan o-ra.mp3').toDestination();
    true;
  `;
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
      const player = new Tone.Player('https://tonejs.github.io/audio/berklee/gurgling_theremin_1.mp3').toDestination();
      </script>
  </body>

  </html>`;
    function handlePress() {
      ref.injectJavaScript(run);
    }
    function handleSlide(value) {
      setTime(value);
      ref.injectJavaScript(slide);


  return (
    <View style={styles.container}>
      <WebView
        source={{html: html}}
        ref={setRef}
        injectedJavaScript={setup}
        onMessage={ev => console.log(ev.nativeEvent.data)}
      />
      <Trimmer
        onHandleChange={(l, r) => {
          setStart(l);
          setEnd(r);
        }}
        totalDuration={60000}
        trimmerLeftHandlePosition={start}
        trimmerRightHandlePosition={end}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  webView: {
    height: 0,
    width: 0,
  },
  playControler: {
    height: 50,
    width: 50,
    top: 0,
    backgroundColor: 'black',
  },
});
