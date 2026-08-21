import React from 'react';
import { CyberOrbitalHome } from '../components/home/CyberOrbitalHome';
import { MotionState } from '../types/motion';

interface HomeProps {
  motionState: MotionState;
  isSocketConnected: boolean;
}

export const Home: React.FC<HomeProps> = () => {
  return <CyberOrbitalHome />;
};
