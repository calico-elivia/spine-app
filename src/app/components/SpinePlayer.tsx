import { useEffect, useRef } from 'react'
import { SpinePlayer } from '@esotericsoftware/spine-player'

interface CustomPlayerProps {
  jsonUrl: string
  atlasUrl: string
  mousePosition: {
    x: number
    y: number
  } | null
  setMousePosition: React.Dispatch<
    React.SetStateAction<{
      x: number
      y: number
    } | null>
  >
  // children?: React.ReactNode;
}

export default function CustomSpinePlayer(props: CustomPlayerProps) {
  const { jsonUrl, atlasUrl, mousePosition, setMousePosition } = props
  const playerContainerRef = useRef(null)

  useEffect(() => {
    // spine動畫
    const p1 = new SpinePlayer(`player-container`, {
      jsonUrl: jsonUrl,
      atlasUrl: atlasUrl,
      skin: 'default',
      showControls: false,
      showLoading: false,
      preserveDrawingBuffer: false,
      alpha: true,
      success: player => {
        const trackEntry = player?.setAnimation('hit', false)
        trackEntry.timeScale = 0.7
        if (trackEntry) {
          trackEntry.listener = {
            complete: () => setMousePosition(null),
          }
        }
      },
      error: function (reason) {
        console.log('spine animation load error', reason)
      },
    })

    if (playerContainerRef.current) {
      p1.play()
    }

    return () => {
      p1?.dispose()
    }
  }, [])

  return (
    <div
      id={`player-container`}
      ref={playerContainerRef}
      style={{
        width: '40vw',
        height: '40vw',
        position: 'absolute',
        top: mousePosition?.y,
        left: mousePosition?.x,
        transform: 'translate(-25%, -50%)',
        pointerEvents: 'none',
      }}
    />
  )
}
