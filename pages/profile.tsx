import dynamic from 'next/dynamic';

const Profile = dynamic(() => import('../src/pages/profile'), { ssr: false });

export default function ProfilePage() {
  return <Profile />;
}
