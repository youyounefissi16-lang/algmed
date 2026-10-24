let audioCtx = null;

const getCtx = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
};

const playTone = (freq, duration, type = 'sine', volume = 0.15) => {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch { /* audio not available */ }
};

const playMulti = (notes, type = 'sine', volume = 0.12) => {
  try {
    const ctx = getCtx();
    notes.forEach(([freq, startOffset, dur]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startOffset);
      gain.gain.setValueAtTime(volume, ctx.currentTime + startOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + startOffset);
      osc.stop(ctx.currentTime + startOffset + dur);
    });
  } catch { /* audio not available */ }
};

const playHeartbeat = () => {
  try {
    const ctx = getCtx();
    const thump = (freq, start, dur, volume) => {
      const t = ctx.currentTime + start;

      const osc = ctx.createOscillator();
      const body = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, t + dur);
      body.gain.setValueAtTime(0.0001, t);
      body.gain.linearRampToValueAtTime(volume, t + 0.012);
      body.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
      const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i++) {
        const env = Math.pow(1 - i / len, 3);
        data[i] = (Math.random() * 2 - 1) * env;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(220, t);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(volume * 0.6, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.8);

      const master = ctx.createBiquadFilter();
      master.type = 'lowpass';
      master.frequency.setValueAtTime(280, t);
      master.Q.setValueAtTime(0.7, t);

      osc.connect(body);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      body.connect(master);
      noiseGain.connect(master);
      master.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + dur);
      noise.start(t);
      noise.stop(t + dur);
    };
    thump(68, 0, 0.19, 0.4);
    thump(55, 0.29, 0.23, 0.28);
  } catch { /* audio not available */ }
};

const sounds = {
  heartbeat: () => playHeartbeat(),
  click:    () => playTone(800, 0.08, 'sine', 0.1),
  navigate: () => playTone(660, 0.06, 'sine', 0.08),
  select:   () => playTone(1200, 0.05, 'sine', 0.08),
  next:     () => playMulti([[523, 0, 0.06], [784, 0.05, 0.08]], 'sine', 0.1),
  prev:     () => playMulti([[659, 0, 0.06], [440, 0.05, 0.08]], 'sine', 0.1),
  success:  () => playMulti([[523, 0, 0.12], [659, 0.1, 0.18]], 'sine', 0.12),
  error:    () => playMulti([[400, 0, 0.15], [300, 0.12, 0.2]], 'sawtooth', 0.08),
  warning:  () => playMulti([[800, 0, 0.1], [800, 0.15, 0.1]], 'square', 0.06),
  submit:   () => playTone(440, 0.25, 'sine', 0.12),
  bookmark: () => playMulti([[880, 0, 0.08], [1100, 0.06, 0.1]], 'sine', 0.1),
  delete:   () => playMulti([[400, 0, 0.2], [250, 0.15, 0.25]], 'sawtooth', 0.08),
  start:    () => playMulti([[262, 0, 0.1], [330, 0.08, 0.1], [392, 0.16, 0.15]], 'sine', 0.1),
};

export const playSound = (type) => {
  const fn = sounds[type];
  if (fn) fn();
};
