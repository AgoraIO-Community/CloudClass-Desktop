import { useRef, useEffect } from 'react';

export const useUnMount = (cb: CallableFunction) => {
  useEffect(() => {
    return () => cb()
  }, [])
}

export const useMounted = () => {
  const mounted = useRef<boolean>(true)

  useEffect(() => {
    return () => {
      mounted.current = false
    }
  }, [])
  return mounted.current
}

export const useTimeout = (fn: CallableFunction, delay: number) => {
  const mounted = useMounted()

  const timer = useRef<any>(null)

  useEffect(() => {
    timer.current = setTimeout(() => {
      fn && mounted && fn()
      if (timer.current) {
        clearTimeout(timer.current)
        timer.current = null
      }
    }, delay)

    return () => {
      if (timer.current) {
        clearTimeout(timer.current)
        timer.current = null
      }
    }
  }, [timer])
}

export const useAudioPlayer = (url: string) => {

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useUnMount(() => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
  })

  useEffect(() => {
    const audioElement = new Audio(url);
    audioElement.onended = () => {
    }
    audioElement.play()
    audioRef.current = audioElement
  }, [audioRef])
}