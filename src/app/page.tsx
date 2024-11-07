'use client' //
import { useCallback, useEffect, useRef, useState } from 'react'
import RabbitSpinePlayer from './components/RabbitSpinePlayer'
import './page.scss'
import { AudioMap, spineAssets, rabbitHolePosition } from './constant'
import CustomSpinePlayer from './components/SpinePlayer'

const websocktUrl = 'wss://m.wlp.asia/wcc?chatId=123&chatName=chat'

const gameItemData = [
  {
    id: 1,
    name: '加速器',
    icon: '',
  },
]
const socket = new WebSocket(websocktUrl)

interface ResData {
  [key: string]:
    | string
    | number
    | boolean
    | string[]
    | {
        [key: string]: string | number | boolean | string[]
      }
}

export default function Home() {
  // 螢幕尺寸
  const [screenSize, setScreenSize] = useState({ x: 0, y: 0 })
  // 遊戲項目
  const [score, setScore] = useState<number>(0)
  const [bonus, setBonus] = useState<number>(0)
  const [active, setActive] = useState(
    Array(9).fill({ status: false, data: null })
  )
  const [coin, setCoin] = useState<number>(0)
  // const [showGameItem, setShowGameItem] = useState(false)
  // const [gameItem, setGameItem] = useState(gameItemData)
  const [message, setMessage] = useState('')

  const [userInfo, setUserInfo] = useState<ResData>({})
  //音效
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const bgAudioRef = useRef<HTMLAudioElement | null>(null)
  //動畫
  const holeWrapRef = useRef<HTMLDivElement | null>(null)
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
  const updateScore = (newScore: number) => {
    setScore(prevScore => {
      // 檢查新的分數與舊的分數是否相同
      if (prevScore === newScore) {
        return prevScore // 如果相同，直接回傳舊的分數
      }
      return newScore // 否則，更新為新的分數
    })
  }

  //websocket msg解析
  const replyMap = (reply: string, data: ResData) => {
    switch (reply) {
      case 'login_ok_response':
        setScore(+data.customer.gold_amount)
        setUserInfo(data)
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
      case 'click_fail_response':
        updateScore(Number(data.total_amount))
        setBonus(Number(data.bonus_amount))
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
      if (event.data instanceof Blob) {
        const file = new Blob([event.data], { type: 'text/plain' })
        file
          .text()
          .then(value => {
            const val = JSON.parse(value)
            val.data = JSON.parse(val.data)
            console.log('val', val)
            if (val.code == 200) {
              replyMap(val.replay, val.data)
            } else {
              console.log('Error Message:', val)
            }
          })
          .catch(error => {
            console.log('Something went wrong', error)
          })
      } else {
        const res = JSON.parse(event.data)
        res.data = JSON.parse(res.data)
        console.log('res', res)
        if (res.code === 200) {
          replyMap(res.replay, res.data)
        }
      }
    }

    window.addEventListener('resize', displayRabbitPosition)

    //錘子監聽
    const holeWrap = holeWrapRef.current
    if (holeWrap) {
      holeWrap.addEventListener('click', event => {
        if (holeWrap && holeWrap.contains(event.target as HTMLElement)) {
          setMousePosition({ x: event.clientX, y: event.clientY })
        }
      })
    }

    // 心跳
    // const interval = setInterval(() => {
    //   console.log('heart beat!')
    //   socket.send(
    //     JSON.stringify({
    //       event: 'heart',
    //     })
    //   )
    // }, 15000)

    return () => {
      window.removeEventListener('resize', displayRabbitPosition)
      console.log('WS Disconnected')
      socket?.close()
      // clearInterval(interval)
    }
  }, [])

  // 加速器
  const handleSpeedUp = () => {
    socket.send(
      JSON.stringify({
        event: 'speed',
      })
    )
  }
  // 升級
  const handleUpgrade = () => {
    if (userInfo.customer.next_level_gold < coin) {
      socket.send(
        JSON.stringify({
          event: 'upgrade',
        })
      )
    }
  }
  // 邀請
  const handleInvite = () => {
    socket.send(
      JSON.stringify({
        event: 'invite',
      })
    )
  }

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
              onClick={() =>
                socket.send(
                  JSON.stringify({
                    event: 'pause',
                  })
                )
              }
            >
              {'PAUSE'}
            </button>
          </div>
          <button onClick={handleSpeedUp}>加速器</button>
        </div>
      </div>
      <div className="holeWrap" ref={holeWrapRef}>
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
        <div className="footerBtn" onClick={handleUpgrade}>
          Upgrade
        </div>
        <div className="footerBtn">Exchange</div>
        <div className="footerBtn">Invite</div>
      </div>
      {/* 提示彈窗 */}
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
      {/* 加速器道具 */}
      {/* {showGameItem && (
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
      )} */}
      {/* 錘子特效 */}
      {mousePosition && (
        <CustomSpinePlayer
          jsonUrl={spineAssets.mallet.jsonUrl}
          atlasUrl={spineAssets.mallet.atlasUrl}
          mousePosition={mousePosition}
          setMousePosition={setMousePosition}
        />
      )}
      {/* 得分特效 */}
      {bonus ? (
        <div
          className="prizeText"
          style={{ left: mousePosition?.x, top: mousePosition?.y }}
        >{`+${bonus}`}</div>
      ) : null}
    </div>
  )
}
