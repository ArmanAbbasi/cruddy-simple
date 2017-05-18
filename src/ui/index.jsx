import React from 'react';
import { render } from 'react-dom';

import App from './components/App.jsx';

const formData = window.__data__;
const schema = window.__schema__;

render(
  (<App
    schema={schema}
    formData={formData}
  />),
  document.getElementById('app')
);
