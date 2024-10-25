// "use client"; //

import { SpinePlayer } from "@esotericsoftware/spine-player";
import { useEffect, useRef, useState } from "react";

export default function CustomSpinePlayer(props: any) {
  const playerContainerRef = useRef(null);
  const [animation, setAnimation] = useState([]);
  const { jsonUrl, atlasUrl, skin, position } = props;
  const [hit, setHit] = useState(false);

  const checkHit = (e) => {};

  useEffect(() => {
    // spine動畫
    const p1 = new SpinePlayer("player-container", {
      jsonUrl: jsonUrl,
      atlasUrl: atlasUrl,
      animations: ["test_ani"],
      skin: skin,
      showControls: false,
      preserveDrawingBuffer: false,
    });

    if (playerContainerRef.current) {
      p1.play();
    }

    return () => {
      p1.dispose();
    };
  }, []);

  return (
    <div style={{ display: "flex" }} className={`rabbit-${position}`}>
      <div
        id="player-container"
        ref={playerContainerRef}
        style={{ width: "100px", height: "100px" }}
        onMouseDown={(e) => {
          console.log(e);
        }}
      />
    </div>
  );
}
