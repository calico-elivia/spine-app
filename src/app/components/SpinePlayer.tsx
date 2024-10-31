import { useEffect, useRef } from "react";
import { SpinePlayer } from "@esotericsoftware/spine-player";

interface CustomPlayerProps {
  jsonUrl: string;
  atlasUrl: string;
  skin: string;
  position: number;
  animationSpeed?: number;
  // children?: React.ReactNode;
}

export default function CustomSpinePlayer(props: CustomPlayerProps) {
  const playerContainerRef = useRef(null);
  const { jsonUrl, atlasUrl, skin, position, animationSpeed } = props;

  const checkHit = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target) console.log("HIT!");
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
      onClick={(event) => checkHit(event)}
    />
  );
}
