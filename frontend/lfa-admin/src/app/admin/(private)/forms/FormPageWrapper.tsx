'use client';

import dynamic from 'next/dynamic';

const FormClient = dynamic(() => import('./Form'), {
  ssr: false,
});

export default function MagazinePageWrapper() {
  return <FormClient />;
}
