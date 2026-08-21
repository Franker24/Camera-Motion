import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { SensorMode } from './pages/SensorMode';
import { PcReceiver } from './pages/PcReceiver';
import { Lab } from './pages/Lab';
import { motionService } from './services/motionService';
import { useMotionSocket } from './hooks/useMotionSocket';
import { MotionState } from './types/motion';

export const App: React.FC = () => {
  const { isConnected } = useMotionSocket('standalone');
  const [motionState, setMotionState] = useState<MotionState>(motionService.getLatestState());

  useEffect(() => {
    const unsubscribe = motionService.subscribe((state) => {
      setMotionState(state);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Layout
        motionState={motionState}
        isSocketConnected={isConnected}
        isCameraActive={motionState.camera.active}
        currentRole={motionState.role}
      >
        <Routes>
          <Route path="/" element={<Home motionState={motionState} isSocketConnected={isConnected} />} />
          <Route path="/sensor" element={<SensorMode />} />
          <Route path="/pc-receiver" element={<PcReceiver />} />
          <Route path="/lab" element={<Lab isSocketConnected={isConnected} />} />
          <Route path="/lab/:module" element={<Lab isSocketConnected={isConnected} />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
