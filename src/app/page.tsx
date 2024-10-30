"use client"; //
import { useEffect, useRef, useState } from "react";
import CustomSpinePlayer from "./components/SpinePlayer";
import "./page.scss";
import { AudioMap, rabbitHolePosition } from "./constant";

const jsonUrl = "assets/rabbit/test_rabbit_000.json";
const atlasUrl = "assets/rabbit/test_rabbit_000.atlas";
const websocktUrl =
  "ws://8.212.129.247:9090/wcc?chatId=54017868&chatName=chacha&refer=54017860";

const gameItemData = [
  {
    id: 1,
    name: "加速器",
    icon: "",
  },
];

export default function Home() {
  const [start, setStart] = useState<boolean | null>(null);
  const [score, setScore] = useState<number>(0);
  const [coin, setCoin] = useState<number>(0);
  const [showPrize, setShowPrize] = useState<boolean>(false);
  const [showGameItem, setShowGameItem] = useState(false);
  const [gameItem, setGameItem] = useState(gameItemData);
  const [message, setMessage] = useState("");
  const [playing, setPlaying] = useState(false);
  const [bgAudio, setBgAudio] = useState<any>(null);
  const audioRef = useRef<any>(null);
  const [screenSize, setScreenSize] = useState({ x: 0, y: 0 });
  const [orderList, setOrderList] = useState([]);
  // const [socket, setSocket] = useState<any>(null);

  // 自適應畫面大小
  const rabbitPosition = () => {
    // 原始背景圖大小
    const defaultWidth = 640;
    const defaultHeight = 982;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const result = { x: width / defaultWidth, y: height / defaultHeight };
    setScreenSize(result);
  };

  // 判斷後端給的是第幾個洞
  const pickHole = (x, y) => {
    const index = (y - 1) * 3 + (x - 1);
    let arr = [...orderList];
    arr.push(index);
    setOrderList(arr);
  };

  useEffect(() => {
    // 设定背景音乐
    setBgAudio(new Audio(AudioMap.game));
    // play();
    // ws连线成功即开始游戏 开始游戏
    const handleStart = () => {
      // if () {
      setMessage("连线失败");
      // }
      setStart(true);
    };

    rabbitPosition();
    pickHole(1, 1);

    //ws
    // setSocket(new WebSocket(websocktUrl));
    // if (!socket) return;
    // const socket = new WebSocket(websocktUrl);

    // socket.onopen = () => {
    //   console.log("WS Connected");
    // };

    // socket.onmessage = (event) => {
    //   console.log("WS Message:", event);
    // };

    // return () => {
    //   console.log("WS Disconnected");
    //   socket?.close();
    // };

    // 監聽click事件
    // document.addEventListener("click", (event) => {
    //   if (start) {
    //     console.log("event.target", event.target);
    //   }
    // });
    window.addEventListener("resize", () => rabbitPosition());
  }, []);

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
      <div className="header flex-1">
        <div className="flex">
          <div className="mr-5">Score: {score}</div>
          <div className="mr-5">Coin: {coin}</div>
        </div>
        <div className="topFixBtns">
          <button onClick={playing ? pause : play}>
            {playing ? "Pause" : "Play"}
          </button>
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
              <CustomSpinePlayer
                jsonUrl={jsonUrl}
                atlasUrl={atlasUrl}
                skin={"001"}
                position={index + 1}
                // animations={["jumpOut"]}
              />
            </div>
          );
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
