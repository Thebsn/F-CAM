import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { SettingsProvider } from './context/SettingsContext.tsx';
import { WorkspaceLayoutProvider } from './context/WorkspaceLayoutContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <SettingsProvider>
    <WorkspaceLayoutProvider>
      <App />
    </WorkspaceLayoutProvider>
  </SettingsProvider>
);
