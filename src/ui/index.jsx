import React from 'react';
import { render } from 'react-dom';

import All from './components/All.jsx';
import Single from './components/Single.jsx';

const data = window.__data__;
const schema = window.__schema__;

const App = Array.isArray(data) ? All : Single;
render(
  (<App
    schema={schema}
    data={data}
  />),
  document.getElementById('app')
);
