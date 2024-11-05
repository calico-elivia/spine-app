'use client' //
import { useCallback, useEffect, useRef, useState } from 'react'
import RabbitSpinePlayer from './components/RabbitSpinePlayer'
import './page.scss'
import { AudioMap, spineAssets, rabbitHolePosition } from './constant'
import CustomSpinePlayer from './components/SpinePlayer'

const websocktUrl =
  'wss://8.212.129.247:9090?chatId=1234&chatName=chat&refer=1234567'
// 'wss://8.212.129.247:9090/wcc?chatId=54017868&chatName=chacha&refer=54017860'
// "ws://8.212.129.247:9090/wcc";

const gameItemData = [
  {
    id: 1,
    name: '加速器',
    icon: '',
  },
]
const socket = new WebSocket(websocktUrl)

export default function Home() {
  // 螢幕尺寸
  const [screenSize, setScreenSize] = useState({ x: 0, y: 0 })
  // 遊戲項目
  const [score, setScore] = useState<string>('0')
  const [active, setActive] = useState(
    Array(9).fill({ status: false, data: null })
  )
  const [coin, setCoin] = useState<number>(0)
  const [showPrize, setShowPrize] = useState<boolean>(false)
  const [showGameItem, setShowGameItem] = useState(false)
  const [gameItem, setGameItem] = useState(gameItemData)
  const [message, setMessage] = useState('')
  //音效
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const bgAudioRef = useRef<HTMLAudioElement | null>(null)
  //動畫
  const [mousePosition, setMousePosition] = useState<{
    x: number
    y: number
  } | null>(null)

  // 自適應畫面大小
  const displayRabbitPosition = () => {
    // 原始背景圖大小
    const defaultWidth = 640
    const defaultHeight = 982
    const width = window.innerWidth
    const height = window.innerHeight
    const result = { x: width / defaultWidth, y: height / defaultHeight }
    setScreenSize(result)
  }

  // 觸發兔子動畫
  const triggerRabbit = useCallback(
    (index: number) => {
      if (index == null) return null
      const level = active[index]?.data?.level || 1

      if (active[index]?.status) {
        return (
          <RabbitSpinePlayer
            jsonUrl={spineAssets.rabbit.jsonUrl}
            atlasUrl={spineAssets.rabbit.atlasUrl}
            skin={String(level).padStart(3, '0')}
            position={index}
            animationSpeed={1}
            socket={socket}
          />
        )
      }
    },
    [active]
  )

  // 更新總分
  const updateScore = (newScore: string) => {
    setScore(prevScore => {
      // 檢查新的分數與舊的分數是否相同
      if (prevScore === newScore) {
        return prevScore // 如果相同，直接回傳舊的分數
      }
      return newScore // 否則，更新為新的分數
    })
  }

  //websocket msg解析
  const replayMap = (
    replay: string,
    data: { [key: string]: number | string }
  ) => {
    switch (replay) {
      case 'login_ok_response':
        // socket.send(
        //   JSON.stringify({
        //     event: "run",
        //   })
        // );
        break
      case 'fail':
        break
      case 'prize_response': {
        const x = +data.x
        const y = +data.y
        const result = y * 3 + x
        const targetTimestamp = +data.expire
        const currentTimestamp = Date.now()
        const delay = targetTimestamp - currentTimestamp

        setActive(prevActive =>
          prevActive.map((item, index) =>
            index === result
              ? {
                  status: true,
                  data: item.data,
                }
              : item
          )
        )
        setTimeout(
          () => {
            setActive(prevActive =>
              prevActive.map((item, index) =>
                index === result
                  ? {
                      status: false,
                      data: null,
                    }
                  : item
              )
            )
          },
          delay > 0 ? delay : 1500
        )
        break
      }
      case 'click_ok_response':
        updateScore(data.total_amount.toString())
        break
      case 'click_fail_response':
        updateScore(data.total_amount.toString())
        break
      default:
        break
    }
  }

  useEffect(() => {
    // 更新兔子位置
    displayRabbitPosition()

    //ws
    socket.onopen = event => {
      console.log('WS Connected:', event)
    }

    socket.onmessage = event => {
      //解讀ws event
      const file = new Blob([event.data], { type: 'application/json' })
      file
        .text()
        .then(value => {
          const val = JSON.parse(value)
          val.data = JSON.parse(val.data)
          if (val.code == 200) {
            console.log(val)
            replayMap(val.replay, val.data)
          } else {
            console.log('Error Message:', val)
          }
        })
        .catch(error => {
          console.log('Something went wrong', JSON.stringify(error))
        })
    }

    window.addEventListener('resize', displayRabbitPosition)
    window.addEventListener('click', event => {
      setMousePosition({ x: event.clientX, y: event.clientY })
    })

    // 心跳
    const interval = setInterval(() => {
      console.log('heart beat!')
      socket.send(
        JSON.stringify({
          event: 'heart', //心跳
        })
      )
    }, 30000)

    return () => {
      window.removeEventListener('resize', displayRabbitPosition)
      console.log('WS Disconnected')
      socket?.close()
      clearInterval(interval)
    }
  }, [])

  // 播放指定音效
  const handlePlayAudio = (type: string) => {
    audioRef.current = new Audio(AudioMap[type])
    audioRef.current.play()
  }

  //背景音樂播放
  const play = () => {
    setPlaying(true)
  }
  //背景音樂暫停
  const pause = () => {
    setPlaying(false)
  }

  useEffect(() => {
    if (playing) {
      bgAudioRef.current = new Audio(AudioMap.game)
      bgAudioRef.current.play()
    } else {
      bgAudioRef.current?.pause()
    }
  }, [playing])

  return (
    <div className="content relative">
      <div className="header flex-1">
        <div className="flex">
          <div className="mr-5">Score: {score}</div>
          {/* <div className="mr-5">Coin: {coin}</div> */}
        </div>
        <div className="topFixBtns">
          <button onClick={playing ? pause : play}>
            {playing ? '音效off' : '音效on'}
          </button>
          <div>
            <button
              onClick={() => {
                socket.send(
                  JSON.stringify({
                    event: 'run',
                  })
                )
              }}
            >
              {'START'}
            </button>
            <span>{'  '}</span>
            <button
              onClick={() => {
                socket.send(
                  JSON.stringify({
                    event: 'pause',
                  })
                )
              }}
            >
              {'PAUSE'}
            </button>
          </div>
          <button onClick={() => setShowGameItem(true)}>加速器</button>
        </div>
      </div>
      <div className="holeWrap">
        {rabbitHolePosition.map((hole, index) => {
          return (
            <div
              className="hole"
              style={{
                left: hole.left * screenSize.x,
                top: hole.top * screenSize.y,
                height: 100 * screenSize.y,
                width: 100 * screenSize.x,
              }}
              key={index}
            >
              {triggerRabbit(index)}
            </div>
          )
        })}
      </div>
      <div className="footer">
        <div className="footerBtn">Mission</div>
        <div className="footerBtn">Upgrade</div>
        <div className="footerBtn">Exchange</div>
        <div className="footerBtn">Invite</div>
      </div>
      {message && (
        <div className="messageModal">
          <button
            className="closeBtn absolute -top-3 -right-3"
            onClick={() => setMessage('')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="messageText">{message}</div>
        </div>
      )}
      {showGameItem && (
        <div>
          <div className="mask absolute top-0 left-0 right-0 bottom-0 w-full h-full bg-black bg-opacity-25 overflow-hidden"></div>
          <div className="gameItemModal relative">
            <button
              className="closeBtn absolute -top-3 -right-3"
              onClick={() => setShowGameItem(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="gameItemList grid grid-cols-3 gap-3">
              {gameItem.map(item => (
                <div className="gameItem" key={item.id}>
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {mousePosition && (
        <CustomSpinePlayer
          jsonUrl={spineAssets.mallet.jsonUrl}
          atlasUrl={spineAssets.mallet.atlasUrl}
          mousePosition={mousePosition}
          setMousePosition={setMousePosition}
        />
      )}
    </div>
  )
}
