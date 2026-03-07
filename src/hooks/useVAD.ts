import { useRef, useCallback, useEffect } from "react";

interface UseVADOptions {
  silenceThreshold?: number;
  silenceDurationMs?: number;
  speechThreshold?: number;
  onSilenceDetected?: () => void;
}

export function useVAD({
  silenceThreshold = 0.01,
  silenceDurationMs = 1500,
  speechThreshold = 0.03,
  onSilenceDetected,
}: UseVADOptions = {}) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const silenceStartRef = useRef<number | null>(null);
  const activeRef = useRef(false);
  const callbackRef = useRef(onSilenceDetected);
  const speechDetectedRef = useRef(false);

  useEffect(() => {
    callbackRef.current = onSilenceDetected;
  }, [onSilenceDetected]);

  const startMonitoring = useCallback((stream: MediaStream) => {
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);

    audioContextRef.current = ctx;
    analyserRef.current = analyser;
    sourceRef.current = source;
    activeRef.current = true;
    silenceStartRef.current = null;
    speechDetectedRef.current = false;

    const dataArray = new Float32Array(analyser.fftSize);

    const check = () => {
      if (!activeRef.current) return;

      analyser.getFloatTimeDomainData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / dataArray.length);

      // Gate: only start silence detection after speech is first detected
      if (!speechDetectedRef.current) {
        if (rms >= speechThreshold) {
          speechDetectedRef.current = true;
        }
        rafRef.current = requestAnimationFrame(check);
        return;
      }

      if (rms < silenceThreshold) {
        if (!silenceStartRef.current) {
          silenceStartRef.current = Date.now();
        } else if (Date.now() - silenceStartRef.current > silenceDurationMs) {
          callbackRef.current?.();
          silenceStartRef.current = null;
          return; // Stop checking after silence detected
        }
      } else {
        silenceStartRef.current = null;
      }

      rafRef.current = requestAnimationFrame(check);
    };

    check();
  }, [silenceThreshold, silenceDurationMs, speechThreshold]);

  const stopMonitoring = useCallback(() => {
    activeRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    sourceRef.current?.disconnect();
    audioContextRef.current?.close();
    audioContextRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
    speechDetectedRef.current = false;
  }, []);

  const getVolume = useCallback((): number => {
    if (!analyserRef.current) return 0;
    const dataArray = new Float32Array(analyserRef.current.fftSize);
    analyserRef.current.getFloatTimeDomainData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    return Math.sqrt(sum / dataArray.length);
  }, []);

  return { startMonitoring, stopMonitoring, getVolume };
}
