import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/en';

const root = ReactDOM.createRoot(document.getElementById('root'));

// if (moment.locale() !== locale) {
//   moment.locale(locale);
// }


root.render(
  <React.StrictMode>
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='en'>
       <App />
    </LocalizationProvider>
   
  </React.StrictMode>
);
