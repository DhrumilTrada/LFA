"use client";

import dynamic from "next/dynamic";

const Editorial = dynamic(() => import("./Editorial"), {
  ssr: false,
});

export default function MagazinePageWrapper() {
  return <Editorial />;
}
