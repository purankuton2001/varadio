import React from 'react';
import {WebView} from 'react-native-webview';

export default function RecordEdit() {
  const html = `<!DOCTYPE html>
  <html lang="en">

  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>音声を編集する</title>

  </head>

  <body>
      <input id="button" type="button" value="play!">
      <script src="https://tonejs.github.io/build/Tone.js"></script>
      <script>
          const synth = new Tone.Synth().toMaster();

          const btn = document.getElementById("button");

          btn.addEventListener("click", e => {
              synth.triggerAttackRelease("C4", "8n"); // 8分音符「♪」の、「ド」を弾く
          });
      </script>
  </body>

  </html>`;
  return <WebView source={{html: html}} scalesPageToFit={true} />;
}
