import dynamic from 'next/dynamic';

const ThemeSettings = dynamic(() => import('../src/pages/theme-settings'), { ssr: false });

export default function ThemeSettingsPage() {
  return <ThemeSettings />;
}
