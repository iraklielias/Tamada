import { useState, useRef, useCallback, useEffect } from "react";

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  const play = useCallback((url: string) => {
    // Stop any existing playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (intervalRef.current) clearInterval(intervalRef.current);

    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onloadedmetadata = () => setDuration(audio.duration);
    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    audio.play();
    setIsPlaying(true);

    intervalRef.current = window.setInterval(() => {
      setCurrentTime(audio.currentTime);
    }, 100);
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const toggle = useCallback(
    (url: string) => {
      if (isPlaying) {
        pause();
      } else if (audioRef.current && audioRef.current.src === url) {
        audioRef.current.play();
        setIsPlaying(true);
        intervalRef.current = window.setInterval(() => {
          setCurrentTime(audioRef.current?.currentTime || 0);
        }, 100);
      } else {
        play(url);
      }
    },
    [isPlaying, pause, play]
  );

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { isPlaying, duration, currentTime, play, pause, toggle, stop };
}
