"""Optional voice-locked soundtrack for the bundled project mixers.

Called by tools/mix.py when script.json audio_mode is voice_locked. Keeps the
original recording's decoded samples/timing, balances stems by gated RMS and
uses one shared constant gain for peak headroom. No ducking or soft clipping.
"""
import json
from pathlib import Path
import numpy as np
from scipy.io import wavfile


def gated_rms(a, sr):
    """50 ms blocks; a scale-invariant gate 40 dB below the loudest block."""
    a = np.asarray(a, dtype=np.float64)
    energy = np.mean(a * a, axis=1) if a.ndim == 2 else a * a
    step = max(1, round(sr * 0.05))
    starts = np.arange(0, len(energy), step)
    if not len(starts):
        return 0.0
    sums = np.add.reduceat(energy, starts)
    counts = np.minimum(step, len(energy) - starts)
    levels = sums / counts
    if levels.max() == 0:
        return 0.0
    gate = float(levels.max()) * 1e-4
    active = levels >= gate
    return float(np.sqrt(sums[active].sum() / counts[active].sum())) if active.any() else 0.0


def _fit(a, n):
    a = np.asarray(a, dtype=np.float64)
    if a.ndim == 1:
        a = np.column_stack((a, a))
    if a.ndim != 2 or a.shape[1] != 2 or not np.isfinite(a).all():
        raise ValueError('Audio must be finite mono or stereo samples')
    out = np.zeros((n, 2), dtype=np.float64)
    out[:min(n, len(a))] = a[:n]
    return out


def mix_project(project, script, cues, sr, load_audio, music_generators, effects):
    project = Path(project)
    source = project / script.get('voice_source', 'data/narration.wav')
    voice = np.asarray(load_audio(source), dtype=np.float64)
    if voice.ndim != 2 or voice.shape[1] != 2 or not len(voice) or not np.isfinite(voice).all():
        raise ValueError('A nonempty finite stereo voice decode is required')
    n = len(voice)
    duration = n / sr
    if abs(float(cues['duration']) - duration) > 1 / 30 + 0.002:
        raise ValueError('Cue duration differs from the original voice. Realign without retiming the voice.')
    vr = gated_rms(voice, sr)
    vp = float(np.abs(voice).max())
    if vr < 1e-6:
        raise ValueError('Voice is silent or below the measurement gate')
    music = np.zeros_like(voice)
    kind = script.get('music', 'bed')
    if kind and kind != 'none':
        music = _fit(music_generators[kind]() if kind in music_generators else load_audio(project / kind), n)
        mr = gated_rms(music, sr)
        if not mr:
            raise ValueError('Requested music is silent')
        music *= 0.5 * vr / mr
    sfx = np.zeros_like(voice)
    for cue in cues['cues']:
        fn = effects.get(cue['type'])
        if fn is None:
            raise ValueError('Unknown sound cue: ' + cue['type'])
        gain = float(cue.get('gain', 1))
        if gain < 0 or not np.isfinite(gain):
            raise ValueError('Sound cue gain must be finite and nonnegative')
        samples = np.asarray(fn(**({'d': cue['dur']} if cue.get('dur') else {})), dtype=np.float64)
        if samples.ndim == 1:
            samples = np.column_stack((samples, samples))
        if samples.ndim != 2 or samples.shape[1] != 2 or not np.isfinite(samples).all():
            raise ValueError('Sound cue generated invalid samples')
        samples *= gain
        start = round(float(cue['t']) * sr)
        offset = max(0, -start)
        start = max(0, start)
        count = min(len(samples) - offset, n - start)
        if count > 0:
            pan = np.clip(float(cue.get('pan', 0)), -1, 1)
            sfx[start:start + count] += samples[offset:offset + count] * [1 - max(0, pan), 1 + min(0, pan)]
    fxr = gated_rms(sfx, sr)
    if fxr:
        sfx *= min(0.5 * vr / fxr, 0.7 * vp / max(1e-12, float(np.abs(sfx).max())))
    mix = voice + music + sfx
    # One constant master gain preserves all relative levels and voice dynamics.
    master = min(1.0, 10 ** (-1 / 20) / max(1e-12, float(np.abs(mix).max())))
    voice, music, sfx, mix = [a * master for a in (voice, music, sfx, mix)]
    dest = project / 'data'
    dest.mkdir(parents=True, exist_ok=True)
    for name, samples in [('voice', voice), ('music', music), ('sfx', sfx), ('mix', mix)]:
        wavfile.write(dest / (name + '.wav'), sr, samples.astype(np.float32))
    report = {
        'mode': 'voice_locked', 'source': str(source), 'sample_rate': sr,
        'samples': n, 'duration': duration, 'master_gain': master,
        'rms_measurement': '50 ms; relative gate=loudest block minus 40 dB',
        'sfx_peak_vs_voice': float(np.abs(sfx).max() / max(1e-12, np.abs(voice).max())),
        'mix_peak_dbfs': float(20 * np.log10(max(1e-12, np.abs(mix).max()))),
        'voice_retimed': False, 'ducking': False,
    }
    # Measure all ratios before the shared gain, including the reference voice.
    original_vr = gated_rms(voice / master, sr)
    for key, stem in [('music_db_vs_voice', music), ('sfx_db_vs_voice', sfx)]:
        rms = gated_rms(stem / master, sr)
        report[key] = float(20 * np.log10(rms / original_vr)) if rms else None
    (dest / 'audio-report.json').write_text(json.dumps(report, indent=2) + '\n')
    print('VOICE LOCK OK: %.3f s; music %s dB; SFX %s dB; peak %.2f dBFS' %
          (duration, report['music_db_vs_voice'], report['sfx_db_vs_voice'], report['mix_peak_dbfs']))
    return report
