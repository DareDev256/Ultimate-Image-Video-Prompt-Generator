import type { Metadata, Viewport } from 'next';
import PhotoEditor from '@/components/editor/PhotoEditor';

export const metadata: Metadata = {
  title: { absolute: 'Blur Face in Photo Online Free, Nothing Uploaded' },
  description:
    'Blur or pixelate faces and anything else in a photo, crop it and save it. Runs in the browser, so nothing leaves your device. Free, no sign-up.',
  alternates: { canonical: '/blur-face-in-photo' },
  openGraph: {
    title: 'Blur Face in Photo Online Free, Nothing Uploaded',
    description: 'Auto-blur faces, paint blur or pixels, crop and save. Everything runs on your device.',
    url: '/blur-face-in-photo',
  },
};

export const viewport: Viewport = {
  viewportFit: 'cover',
  themeColor: '#000000',
};

export default function BlurFaceInPhotoPage() {
  return <PhotoEditor />;
}
