import React from 'react';
import Form from 'react-jsonschema-form';

const App = ({ formData, schema }) => {
  return (
    <div className="panel panel-default">
      <div className="panel-body">
        <Form
          schema={schema}
          formData={formData}
          onChange={() => console.log('change')}
          onSubmit={() => console.log('submit')}
          onError={() => console.log('error')}
        />
      </div>
    </div>
  );
};

export default App;
