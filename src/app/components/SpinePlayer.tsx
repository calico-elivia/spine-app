import { useEffect, useRef } from "react";
import { SpinePlayer } from "@esotericsoftware/spine-player";

export default function CustomSpinePlayer(props: any) {
  const playerContainerRef = useRef(null);
  const { jsonUrl, atlasUrl, skin, position, animationSpeed } = props;

  const checkHit = (e) => {
    if (e.target) console.log("HIT!");
  };

  useEffect(() => {
    // spine動畫
    const p1 = new SpinePlayer(`player-container-${position}`, {
      jsonUrl: jsonUrl,
      atlasUrl: atlasUrl,
      skin: skin,
      showControls: false,
      preserveDrawingBuffer: false,
      alpha: true, // Enable player translucency
      success: (player) => {
        player.setAnimation("jumpOut", false);
        player.addAnimation("idle", true, 0.5);
      },
      error: function (reason) {
        console.log("spine animation load error", reason);
      },
    });

    if (playerContainerRef.current) {
      p1.play();
    }

    return () => {
      p1.dispose();
    };
  }, []);

  return (
    <div
      id={`player-container-${position}`}
      ref={playerContainerRef}
      style={{
        width: "100%",
        height: "100%",
      }}
      onMouseDown={(e) => checkHit(e)}
    />
  );
}
