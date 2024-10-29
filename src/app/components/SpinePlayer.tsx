import { useEffect, useRef, useState } from "react";
import { SpinePlayer } from "@esotericsoftware/spine-player";
import "./spinePlayer.scss";

export default function CustomSpinePlayer(props: any) {
  const playerContainerRef = useRef(null);
  // const [animation, setAnimation] = useState([]);
  const { jsonUrl, atlasUrl, skin, position, animations } = props;
  const [hit, setHit] = useState(false);

  const checkHit = (e) => {};

  useEffect(() => {
    // spine動畫
    const p1 = new SpinePlayer(`player-container-${position}`, {
      jsonUrl: jsonUrl,
      atlasUrl: atlasUrl,
      // animations: ["idle"],
      skin: skin,
      showControls: false,
      preserveDrawingBuffer: false,
      alpha: true, // Enable player translucency
      success: (player) => {
        console.log(player);
        // player.setAnimation("hit", true);
      },
    });

    if (playerContainerRef.current) {
      // p1.play();
    }

    return () => {
      p1.dispose();
    };
  }, []);

  return (
    <div
      id={`player-container-${position}`}
      ref={playerContainerRef}
      style={{ width: "100px", height: "100px" }}
      onMouseDown={(e) => {
        console.log(e);
      }}
    />
  );
}
