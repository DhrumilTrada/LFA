'use client';

import dynamic from 'next/dynamic';

const MagazineClient = dynamic(() => import('./MagazineClient'), {
  ssr: false,
});

export default function MagazinePageWrapper() {
  return <MagazineClient />;
}
