import React from 'react';
import OceanBackdrop from './OceanBackdrop';
import OceanParticles from './OceanParticles';
import OceanSidebar from './OceanSidebar';

const PageContainer = ({ children }) => (
  <div className="page-shell">
    <OceanBackdrop />
    <OceanParticles />
    <div className="ocean-sidebar-placeholder">
      <OceanSidebar />
    </div>
    <main className="page-main">
      <div className="page-main-inner">{children}</div>
    </main>
  </div>
);

export default PageContainer;
