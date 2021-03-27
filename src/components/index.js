const player = new Tone.Player(
  'https://tonejs.github.io/audio/drum-samples/loops/ominous.mp3'
).toDestination();

const btn = document.getElementById('button');
const time = document.getElementById('time');

btn.addEventListener('click', e => {
  player.start();
});

time.addEventListener('change', e => {
  player.start(0, time.value);
});
