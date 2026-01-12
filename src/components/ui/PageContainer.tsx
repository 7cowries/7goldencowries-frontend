import React from 'react';
import OceanBackdrop from './OceanBackdrop';
import OceanParticles from './OceanParticles';
import OceanSidebar from './OceanSidebar';

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  return (
    <OceanBackdrop>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <OceanSidebar />
        <main style={{ flex: 1, padding: '32px', position: 'relative' }}>
          <OceanParticles />
          <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
        </main>
      </div>
    </OceanBackdrop>
  );
};

export default PageContainer;
