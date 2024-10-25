"use client"; //
import { useEffect, useRef, useState } from "react";
import CustomSpinePlayer from "./components/SpinePlayer";
import "./page.scss";
import { AudioMap } from "./constant";

const jsonUrl = "assets/rabbit/test_rabbit_000 (1).json";
const atlasUrl = "assets/rabbit/test_rabbit_000 (1).atlas";
const websocktUrl =
  "ws://8.212.129.247:9090/wcc?chatId=54017868&chatName=chacha&refer=54017860";

const gameItemData = [
  {
    id: 1,
    name: "加速器",
    icon: "",
  },
  {
    id: 2,
    name: "两倍积分",
    icon: "",
  },
];

export default function Home() {
  const intervalRef = useRef<any>(null);
  const [start, setStart] = useState<boolean | null>(null);
  const [timer, setTimer] = useState<number>(5);
  const [score, setScore] = useState<number>(0);
  const [coin, setCoin] = useState<number>(0);
  const [showPrize, setShowPrize] = useState<boolean>(false);
  const [showGameItem, setShowGameItem] = useState(false);
  const [gameItem, setGameItem] = useState(gameItemData);
  const [message, setMessage] = useState("");
  const [playing, setPlaying] = useState(false);
  const [bgAudio, setBgAudio] = useState<any>(null);
  const audioRef = useRef<any>(null);
  // const [socket, setSocket] = useState<any>(null);

  // 检查是否有硬币游玩
  const checkAvailable = () => {
    if (coin < 10) {
      setMessage("coin数量不足");
      return false;
    } else {
      // 消耗硬币接口
      return true;
    }
  };

  // 开始游戏
  const handleStart = () => {
    if (!checkAvailable()) {
      return;
    }
    setStart(true);
  };

  // 重新开始游戏
  const handleRestart = () => {
    if (!checkAvailable()) {
      return;
    }
    setShowPrize(false);
    setScore(0);
    setStart(true);
  };

  // 重置数据
  const resetData = () => {
    setStart(false);
    setTimer(10);
  };

  useEffect(() => {
    // 设定背景音乐
    setBgAudio(new Audio(AudioMap.game));

    // 获取玩家资源
    const getCoin = () => {
      setCoin(100);
    };
    getCoin();

    //ws
    // setSocket(new WebSocket(websocktUrl));
    // if (!socket) return;
    const socket = new WebSocket(websocktUrl);

    socket.onopen = () => {
      console.log("WS Connected");
    };

    socket.onmessage = (event) => {
      console.log("WS Message:", event);
    };

    return () => {
      console.log("WS Disconnected");
      socket?.close();
    };
  }, []);

  useEffect(() => {
    intervalRef.current = timer;
  }, [timer]);

  // 開始遊戲時啟動倒計時
  useEffect(() => {
    if (!start) return;

    const interval = setInterval(() => {
      // 游戏结束时，出现奖励与重置数据
      if (intervalRef.current === 0) {
        setShowPrize(true);
        resetData();
        return;
      }
      setTimer((t) => t - 1);
    }, 1000);

    // 播放背景音樂
    // play();

    // 監聽click事件
    // document.addEventListener("click", (event) => {
    //   if (start) {
    //     console.log("event.target", event.target);
    //   }
    // });

    return () => {
      clearInterval(interval);
    };
  }, [start]);

  //背景音樂播放
  const play = () => {
    setPlaying(true);
    bgAudio.play();
  };
  //背景音樂暫停
  const pause = () => {
    setPlaying(false);
    bgAudio.pause();
  };

  // 播放指定音效
  const handlePlayAudio = (type: string) => {
    audioRef.current = new Audio(AudioMap[type]);
    audioRef.current.play();
  };

  return (
    <div className="content relative">
      {/* <CustomSpinePlayer jsonUrl={jsonUrl} atlasUrl={atlasUrl} /> */}
      <div className="header flex-1">
        <div className="flex">
          <div className="mr-5">Score: {score}</div>
          <div className="mr-5">Coin: {coin}</div>
        </div>
        {start && !showPrize && <div className="timer">{timer}秒</div>}
        <div className="topFixBtns">
          <button onClick={playing ? pause : play}>
            {playing ? "Pause" : "Play"}
          </button>
          <button onClick={() => setShowGameItem(true)}>道具</button>
        </div>
      </div>
      <div className="holeWrap grid grid-cols-3 gap-3 flex-none">
        <div className="hole hole1">1</div>
        <div className="hole hole2">2</div>
        <div className="hole hole3">3</div>
        <div className="hole hole4">4</div>
        <div className="hole hole5">5</div>
        <div className="hole hole6">6</div>
        <div className="hole hole7">7</div>
        <div className="hole hole8">8</div>
        <div className="hole hole9">
          <CustomSpinePlayer
            jsonUrl={jsonUrl}
            atlasUrl={atlasUrl}
            skin={"001"}
            position={9}
          />
        </div>
      </div>
      <div className="footer">
        <div className="footerBtn">Mission</div>
        <div className="footerBtn">Upgrade</div>
        <div className="footerBtn">Exchange</div>
        <div className="footerBtn">Invite</div>
      </div>
      {!start && !showPrize && (
        <button className="startBtn" onClick={handleStart}>
          开始游戏
        </button>
      )}
      {showPrize && (
        <div className="prizeModal">
          <div className="prizeText">游戏结束!!</div>
          <div className="prizeText">您的得分：{score}</div>
          <button className="restartBtn" onClick={handleRestart}>
            重新开始
          </button>
        </div>
      )}
      {message && (
        <div className="messageModal">
          <button
            className="closeBtn absolute -top-3 -right-3"
            onClick={() => setMessage("")}
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
              {gameItem.map((item) => (
                <div className="gameItem" key={item.id}>
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
