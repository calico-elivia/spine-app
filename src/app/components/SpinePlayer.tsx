// "use client"; //

import { SpinePlayer } from "@esotericsoftware/spine-player";
import { useEffect, useRef } from "react";

export default function CustomSpinePlayer(props: any) {
  const playerContainerRef = useRef(null);
  const playerContainerRef2 = useRef(null);
  const { jsonUrl, atlasUrl } = props;

  useEffect(() => {
    const p1 = new SpinePlayer("player-container", {
      jsonUrl: jsonUrl,
      atlasUrl: atlasUrl,
      animations: ["animation"],
      skin: "001",
      showControls: false,
      preserveDrawingBuffer: false,
    });

    const p2 = new SpinePlayer("player-container2", {
      jsonUrl: jsonUrl,
      atlasUrl: atlasUrl,
      animations: ["animation"],
      skin: "002",
      showControls: false,
      preserveDrawingBuffer: false,
    });

    if (playerContainerRef.current) {
      p1.play();
    }
    if (playerContainerRef2.current) {
      p2.play();
    }

    return () => {
      p1.dispose();
      p2.dispose();
    };
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <div
        id="player-container"
        ref={playerContainerRef}
        style={{ width: "100px", height: "100px" }}
      />
      <div
        id="player-container2"
        ref={playerContainerRef2}
        style={{ width: "100px", height: "100px" }}
      />
    </div>
  );
}
