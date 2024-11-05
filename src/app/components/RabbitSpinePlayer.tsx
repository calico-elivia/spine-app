import { useEffect, useRef, useState } from 'react'
import { SpinePlayer } from '@esotericsoftware/spine-player'

interface CustomPlayerProps {
  jsonUrl: string
  atlasUrl: string
  skin: string
  position: number
  animationSpeed?: number
  socket: WebSocket
  // children?: React.ReactNode;
}

export default function RabbitSpinePlayer(props: CustomPlayerProps) {
  const { jsonUrl, atlasUrl, skin, position, animationSpeed, socket } = props
  const playerContainerRef = useRef(null)
  const playerRef = useRef<SpinePlayer | null>(null)
  //判断是否销毁兔宝宝
  const [finished, setFinished] = useState(false)

  // 擊中
  const checkHit = (event: React.MouseEvent<HTMLElement>) => {
    const tar = event.target as HTMLElement
    //确定击中兔宝宝
    if (tar && tar.tagName == 'CANVAS') {
      console.log('HIT!')
      //播放动画
      const trackEntry = playerRef.current?.addAnimation('hit', false)
      if (trackEntry) {
        trackEntry.listener = {
          complete: () => setFinished(true),
        }
      }

      // 計算x,y軸位置
      const x = position % 3
      const y = Math.floor(position / 3)

      // 推送後端
      socket.send(
        JSON.stringify({
          event: 'click',
          data: JSON.stringify({ x: x, y: y }),
        })
      )
    }
  }

  useEffect(() => {
    // spine動畫
    if (playerContainerRef.current && !playerRef.current) {
      const p1 = new SpinePlayer(`player-container-${position}`, {
        jsonUrl: jsonUrl,
        atlasUrl: atlasUrl,
        skin: skin,
        showControls: false,
        showLoading: false,
        preserveDrawingBuffer: false,
        alpha: true, // Enable player translucency
        success: player => {
          player.setAnimation('jumpOut', false)
          player.addAnimation('idle', true, 0.5)
        },
        error: function (reason) {
          console.log('spine animation load error', reason)
        },
      })
      playerRef.current = p1
    }

    if (playerContainerRef.current) {
      playerRef.current?.play()
    }

    return () => {
      playerRef.current?.dispose()
      playerRef.current = null
    }
  }, [])

  // 销毁兔宝宝
  useEffect(() => {
    if (finished) {
      playerRef.current?.dispose()
      playerRef.current = null
    }
  }, [finished])

  return (
    <div
      id={`player-container-${position}`}
      ref={playerContainerRef}
      style={{
        width: '100%',
        height: '100%',
      }}
      onClick={event => checkHit(event)}
    />
  )
}
