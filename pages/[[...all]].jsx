import React from 'react';
import dynamic from 'next/dynamic';

const AppNoSSR = dynamic(() => import('../src/App'), {
  ssr: false,
  loading: () => <p style={{color:"#fff",padding:"1rem"}}>Loading app…</p>,
});

class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error){ return { error }; }
  componentDidCatch(error, info){ console.error('App error:', error, info); }
  render(){
    if (this.state.error) {
      return (
        <pre style={{color:"#fff",background:"#111",padding:"1rem",whiteSpace:"pre-wrap"}}>
{String(this.state.error)}
        </pre>
      );
    }
    return this.props.children;
  }
}

export default function CatchAll(){ return <ErrorBoundary><AppNoSSR/></ErrorBoundary>; }
