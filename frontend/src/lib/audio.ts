/**
 * SYNTHESIZED WEB AUDIO TAP SOUND DESIGNS FOR CONSOLE FEEDBACK
 */
let audioCtx: AudioContext | null = null;

export function playClickSound() {
  try {
    // Lazy initialize to bypass initial browser gesture restrictions
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    // Crisp high frequency click/tap
    osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.09);
  } catch (error) {
    // Graceful silence if system audio is not initialized or forbidden
    console.debug("Audio synthesis skipped:", error);
  }
}

export function playSuccessSound() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    // Premium soft chime
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.02, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.connect(gain);
      gain.connect(audioCtx!.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    playTone(523.25, now, 0.15); // C5
    playTone(659.25, now + 0.1, 0.25); // E5
  } catch (error) {
    console.debug("Success audio synthesis skipped:", error);
  }
}
