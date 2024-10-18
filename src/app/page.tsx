"use client"; //
import CustomSpinePlayer from "./components/SpinePlayer";

export default function Home() {
  const jsonUrl = "assets/rabbit/test_rabbit_000.json";
  const atlasUrl = "assets/rabbit/test_rabbit_000.atlas";

  return (
    <div>
      <CustomSpinePlayer jsonUrl={jsonUrl} atlasUrl={atlasUrl} />
    </div>
  );
}
