const sounds = {
  grass: { filter: 720, gain: 0.18, frequency: 115 },
  dirt: { filter: 560, gain: 0.2, frequency: 95 },
  sand: { filter: 1450, gain: 0.16, frequency: 150 },
  stone: { filter: 1900, gain: 0.25, frequency: 210 },
  bedrock: { filter: 1700, gain: 0.25, frequency: 190 },
  wood: { filter: 980, gain: 0.23, frequency: 165 },
  planks: { filter: 1020, gain: 0.23, frequency: 170 },
  crafting_table: { filter: 920, gain: 0.23, frequency: 155 },
  leaves: { filter: 2300, gain: 0.12, frequency: 240 },
};

export function createFootstepAudio() {
  let context;
  let noise;

  function prepare() {
    if (!context) {
      const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!AudioContextClass) return;
      context = new AudioContextClass();
      noise = context.createBuffer(1, Math.floor(context.sampleRate * 0.18), context.sampleRate);
      const samples = noise.getChannelData(0);
      for (let i = 0; i < samples.length; i++) {
        samples[i] = (Math.random() * 2 - 1) * (1 - i / samples.length);
      }
    }
    if (context.state === 'suspended') context.resume().catch(() => {});
  }

  function play(surface) {
    if (context?.state !== 'running' || !noise) return;
    const sound = sounds[surface] ?? { filter: 750, gain: 0.18, frequency: 120 };
    const now = context.currentTime;
    const variation = 0.88 + Math.random() * 0.24;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = noise;
    filter.type = 'lowpass';
    filter.frequency.value = sound.filter * variation;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(sound.gain * variation, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    source.connect(filter).connect(gain).connect(context.destination);
    source.start(now);
    source.stop(now + 0.16);

    const thump = context.createOscillator();
    const thumpGain = context.createGain();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(sound.frequency * variation, now);
    thump.frequency.exponentialRampToValueAtTime(sound.frequency * 0.55, now + 0.07);
    thumpGain.gain.setValueAtTime(0.001, now);
    thumpGain.gain.linearRampToValueAtTime(sound.gain * 0.18, now + 0.008);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    thump.connect(thumpGain).connect(context.destination);
    thump.start(now);
    thump.stop(now + 0.09);
  }

  return { prepare, play };
}
