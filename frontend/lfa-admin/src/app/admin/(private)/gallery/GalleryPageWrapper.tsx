'use client';

import dynamic from 'next/dynamic';

const GalleryClient = dynamic(() => import('./Gallery'), {
  ssr: false,
});

export default function MagazinePageWrapper() {
  return <GalleryClient />;
}
