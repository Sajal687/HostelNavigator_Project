import {createRoot} from 'react-dom/client';
import { CssBaseline, ThemeProvider } from '@mui/material';
import './index.css';
import App from './App';
import theme from './theme';
import { warmUpBackend } from './services/apiClient';

warmUpBackend();

const root = createRoot(document.getElementById('root'));

root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App/>
  </ThemeProvider>
);

