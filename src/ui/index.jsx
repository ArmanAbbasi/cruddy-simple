import React from 'react';
import { render } from 'react-dom';
import { isEmpty } from 'ramda';

import All from './components/All.jsx';
import Single from './components/Single.jsx';
import Create from './components/Create.jsx';

const data = window.__data__;
const schema = window.__schema__;
const resource = window.__resource__;

const getApp = data => {
  if (Array.isArray(data)) {
    return All;
  }
  if (isEmpty(data)) {
    return Create;
  }

  return Single;
};

const App = getApp(data);

render(
  (<App
    schema={schema}
    data={data}
    resource={resource}
  />),
  document.getElementById('app')
);
