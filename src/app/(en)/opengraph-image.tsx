import { ogSize, profileCard } from '@/components/og/ProfileCard';

export const alt = 'Dmytro Yevlakhov, senior full-stack engineer';
export const size = ogSize;
export const contentType = 'image/png';

export default function Image() {
  return profileCard('en');
}
