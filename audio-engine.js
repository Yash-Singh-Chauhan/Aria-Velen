/**
 * ARIA VELEN — Web Audio API Sound Synthesizer & Track Engine
 * Generates lush ambient cinematic chords, sub-bass drones, vinyl crackle,
 * and feeds real-time frequency data into the Three.js 3D models.
 */

(function () {
  'use strict';

  class AriaAudioEngine {
    constructor() {
      this.ctx = null;
      this.isPlaying = false;
      this.isAmbientActive = false;
      this.currentTrackIndex = 0;
      this.bassBoost = 0.7;
      
      this.analyser = null;
      this.dataArray = null;

      // Synth nodes
      this.masterGain = null;
      this.ambientGain = null;
      this.droneOsc1 = null;
      this.droneOsc2 = null;
      this.filter = null;
      this.lfo = null;
      this.crackleNode = null;
      this.crackleGain = null;
      this.stopTimeout = null;

      // Track metadata
      this.tracks = [
        {
          title: 'The Frequency (Original Mix)',
          album: 'Album: "The Frequency" • Master 24-bit',
          bpm: 68,
          rootFreq: 110, // A2 note
          scale: [110, 130.81, 164.81, 196.0, 220],
          duration: 252
        },
        {
          title: 'Solitude in Gold',
          album: 'Album: "The Frequency" • Ambient Version',
          bpm: 54,
          rootFreq: 98.0, // G2 note
          scale: [98.0, 123.47, 146.83, 174.61, 196.0],
          duration: 340
        },
        {
          title: 'Echoes of Void',
          album: 'Album: "The Frequency" • Kinetic Edition',
          bpm: 112,
          rootFreq: 123.47, // B2 note
          scale: [123.47, 146.83, 164.81, 196.0, 246.94],
          duration: 235
        },
        {
          title: 'Velvet Horizon',
          album: 'Album: "The Frequency" • Symphonic Finale',
          bpm: 60,
          rootFreq: 87.31, // F2 note
          scale: [87.31, 110.0, 130.81, 174.61, 220.0],
          duration: 288
        }
      ];

      this.currentTime = 0;
      this.progressInterval = null;
    }

    initContext() {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContextClass();

        // Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

        // Analyser node for 3D visualizer
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 64;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

        // Connect Master -> Analyser -> Speakers
        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
      }

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    // Generates subtle vinyl needle surface crackle
    createVinylCrackle() {
      if (!this.ctx) return;
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (Math.random() < 0.003) ? white * 0.4 : white * 0.008;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      whiteNoise.loop = true;

      const crackleFilter = this.ctx.createBiquadFilter();
      crackleFilter.type = 'bandpass';
      crackleFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);
      crackleFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

      const crackleGain = this.ctx.createGain();
      crackleGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

      whiteNoise.connect(crackleFilter);
      crackleFilter.connect(crackleGain);
      crackleGain.connect(this.masterGain);

      whiteNoise.start();
      this.crackleNode = whiteNoise;
      this.crackleGain = crackleGain;
    }

    // Applies the bass-boost slider in real time (it used to only take effect
    // on the next track start)
    setBassBoost(value) {
      this.bassBoost = Math.max(0, Math.min(1, value));
      if (this.filter && this.ctx) {
        this.filter.frequency.setTargetAtTime(350 * (1 + this.bassBoost), this.ctx.currentTime, 0.05);
      }
    }

    // Play/Pause current track
    togglePlayback() {
      this.initContext();

      if (this.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
      return this.isPlaying;
    }

    play() {
      this.initContext();
      this.isPlaying = true;
      this.startSynthesizerTrack();

      if (window.Aria3DEngine) {
        window.Aria3DEngine.setMusicPlaying(true);
      }

      this.updatePlayerUI(true);
      this.startProgressTimer();
      this.startFrequencyPolling();
    }

    pause() {
      this.isPlaying = false;
      this.stopSynthesizerTrack();

      if (window.Aria3DEngine) {
        window.Aria3DEngine.setMusicPlaying(false);
      }

      this.updatePlayerUI(false);
      clearInterval(this.progressInterval);
      this.stopFrequencyPolling();
    }

    startSynthesizerTrack() {
      if (!this.ctx) return;
      clearTimeout(this.stopTimeout);

      if (this.crackleGain) {
        this.crackleGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      }

      const track = this.tracks[this.currentTrackIndex];

      // Low Warm Drone Oscillator 1 (Sawtooth filtered)
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = 'sawtooth';
      this.droneOsc1.frequency.setValueAtTime(track.rootFreq, this.ctx.currentTime);

      // Sub-Bass Drone Oscillator 2 (Sine)
      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = 'sine';
      this.droneOsc2.frequency.setValueAtTime(track.rootFreq / 2, this.ctx.currentTime);

      // Low Pass Cinematic Filter
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(350 * (1 + this.bassBoost), this.ctx.currentTime);
      this.filter.Q.setValueAtTime(4.0, this.ctx.currentTime);

      // LFO filter modulation for breathing organic texture
      this.lfo = this.ctx.createOscillator();
      this.lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(180, this.ctx.currentTime);
      this.lfo.connect(lfoGain);
      lfoGain.connect(this.filter.frequency);

      // Gain Envelope
      this.trackGain = this.ctx.createGain();
      this.trackGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.trackGain.gain.exponentialRampToValueAtTime(0.4, this.ctx.currentTime + 1.5);

      this.droneOsc1.connect(this.filter);
      this.droneOsc2.connect(this.trackGain);
      this.filter.connect(this.trackGain);
      this.trackGain.connect(this.masterGain);

      this.droneOsc1.start();
      this.droneOsc2.start();
      this.lfo.start();

      // Start vinyl crackle for realism
      if (!this.crackleNode) {
        this.createVinylCrackle();
      }

      // Schedule melodic arpeggio chords
      this.scheduleChordPads(track);
    }

    scheduleChordPads(track) {
      if (!this.isPlaying || !this.ctx) return;

      this.activeChordNodes = this.activeChordNodes || [];

      const playNote = (freq, time, dur) => {
        if (!this.isPlaying) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        g.gain.setValueAtTime(0.001, time);
        g.gain.linearRampToValueAtTime(0.12, time + 0.8);
        g.gain.exponentialRampToValueAtTime(0.001, time + dur);

        osc.connect(g);
        g.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + dur);

        this.activeChordNodes.push({ osc, gain: g });
      };

      const now = this.ctx.currentTime;
      track.scale.forEach((note, i) => {
        playNote(note * 2, now + i * 2.2, 4.0);
      });

      this.chordTimeout = setTimeout(() => {
        if (this.isPlaying) this.scheduleChordPads(track);
      }, track.scale.length * 2200);
    }

    stopSynthesizerTrack() {
      if (this.activeChordNodes && this.activeChordNodes.length) {
        this.activeChordNodes.forEach(node => {
          try {
            node.osc.stop();
            node.osc.disconnect();
            node.gain.disconnect();
          } catch (e) {}
        });
        this.activeChordNodes = [];
      }

      if (this.crackleGain && this.ctx) {
        this.crackleGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      }

      if (this.trackGain && this.ctx) {
        this.trackGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
        const osc1 = this.droneOsc1;
        const osc2 = this.droneOsc2;
        const lfo = this.lfo;
        this.droneOsc1 = null;
        this.droneOsc2 = null;
        this.lfo = null;
        clearTimeout(this.stopTimeout);
        this.stopTimeout = setTimeout(() => {
          try {
            if (osc1) { osc1.stop(); osc1.disconnect(); }
            if (osc2) { osc2.stop(); osc2.disconnect(); }
            if (lfo) { lfo.stop(); lfo.disconnect(); }
          } catch (e) {}
        }, 500);
      }
      clearTimeout(this.chordTimeout);
    }

    setTrack(index) {
      this.currentTrackIndex = (index + this.tracks.length) % this.tracks.length;
      this.currentTime = 0;
      const track = this.tracks[this.currentTrackIndex];

      const titleEl = document.getElementById('player-title');
      const albumEl = document.getElementById('player-album');
      const totalTimeEl = document.getElementById('time-total');

      if (titleEl) titleEl.textContent = `${track.title}`;
      if (albumEl) albumEl.textContent = track.album;
      if (totalTimeEl) totalTimeEl.textContent = this.formatTime(track.duration);

      const progressBar = document.getElementById('player-progress-bar');
      const scrubKnob = document.getElementById('player-scrub-knob');
      const currentTimeEl = document.getElementById('time-current');
      if (progressBar) progressBar.style.width = '0%';
      if (scrubKnob) scrubKnob.style.left = '0%';
      if (currentTimeEl) currentTimeEl.textContent = '00:00';

      // Highlight active track row
      const rows = document.querySelectorAll('.track-row');
      rows.forEach((r, idx) => {
        if (idx === this.currentTrackIndex) {
          r.classList.add('active-track');
        } else {
          r.classList.remove('active-track');
        }
      });

      if (this.isPlaying) {
        this.stopSynthesizerTrack();
        this.startSynthesizerTrack();
      }
    }

    nextTrack() {
      this.setTrack(this.currentTrackIndex + 1);
    }

    prevTrack() {
      this.setTrack(this.currentTrackIndex - 1);
    }

    startProgressTimer() {
      clearInterval(this.progressInterval);
      const progressBar = document.getElementById('player-progress-bar');
      const scrubKnob = document.getElementById('player-scrub-knob');
      const currentTimeEl = document.getElementById('time-current');

      this.progressInterval = setInterval(() => {
        if (!this.isPlaying) return;
        this.currentTime += 1;
        const track = this.tracks[this.currentTrackIndex];

        if (this.currentTime >= track.duration) {
          this.nextTrack();
          return;
        }

        const pct = (this.currentTime / track.duration) * 100;
        if (progressBar) progressBar.style.width = `${pct}%`;
        if (scrubKnob) scrubKnob.style.left = `${pct}%`;
        if (currentTimeEl) currentTimeEl.textContent = this.formatTime(this.currentTime);
      }, 1000);
    }

    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    updatePlayerUI(playing) {
      const playSvg = document.getElementById('play-btn-svg');
      const pauseSvg = document.getElementById('pause-btn-svg');
      const nowPlayingIcon = document.getElementById('now-playing-icon');
      const soundBtn = document.getElementById('sound-toggle-btn');
      const soundStatus = document.getElementById('sound-status-text');

      if (playSvg && pauseSvg) {
        playSvg.style.display = playing ? 'none' : 'block';
        pauseSvg.style.display = playing ? 'block' : 'none';
      }

      // Keep the icon-only play button's accessible name in sync with state
      const playPauseBtn = document.getElementById('play-pause-btn');
      if (playPauseBtn) {
        playPauseBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
      }

      if (nowPlayingIcon) {
        nowPlayingIcon.textContent = playing ? '⏸' : '▶';
      }

      if (soundBtn && soundStatus) {
        if (playing) {
          soundBtn.classList.add('playing');
          soundStatus.textContent = 'SOUND: ON';
        } else {
          soundBtn.classList.remove('playing');
          soundStatus.textContent = 'SOUND: OFF';
        }
      }

      const pulseBtn = document.getElementById('sound-pulse-toggle');
      if (pulseBtn) {
        if (playing) {
          pulseBtn.classList.add('active');
          pulseBtn.innerHTML = '<span>⚡ PULSE ACTIVE</span>';
        } else {
          pulseBtn.classList.remove('active');
          pulseBtn.innerHTML = '<span>⚡ AUDIO PULSE</span>';
        }
      }
    }

    stopFrequencyPolling() {
      if (this.freqPollRaf) {
        cancelAnimationFrame(this.freqPollRaf);
        this.freqPollRaf = null;
      }
      if (window.Aria3DEngine) {
        window.Aria3DEngine.setAudioFrequency(0, 0);
      }
    }

    // Sends frequency data to 3D models only while actively playing
    startFrequencyPolling() {
      this.stopFrequencyPolling();
      const poll = () => {
        if (!this.isPlaying) return;
        if (this.analyser && this.dataArray) {
          this.analyser.getByteFrequencyData(this.dataArray);
          let sum = 0;
          for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
          }
          const avg = sum / this.dataArray.length / 255;
          const bass = (this.dataArray[0] + this.dataArray[1]) / 2 / 255;

          if (window.Aria3DEngine) {
            window.Aria3DEngine.setAudioFrequency(avg, bass);
          }
        }
        this.freqPollRaf = requestAnimationFrame(poll);
      };
      this.freqPollRaf = requestAnimationFrame(poll);
    }
  }

  // Instantiate and expose globally
  window.AriaAudio = new AriaAudioEngine();

})();
