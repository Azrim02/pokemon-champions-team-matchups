import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { adoptDefaultTeam } from './teams';
import './styles.css';

adoptDefaultTeam();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
