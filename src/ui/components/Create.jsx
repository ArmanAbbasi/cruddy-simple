import fetch from 'isomorphic-fetch'
import React from 'react';
import Form from 'react-jsonschema-form';

const CustomTitleField = ({title, required}) => {
  const legend = required ? title + '*' : title;
  return <div id="custom"><h4>{legend.toUpperCase()}</h4></div>;
};

const fields = {
  TitleField: CustomTitleField
};

const create = ({ formData }) => {
  fetch(`/group`, { method: 'POST', headers: { 'Content-type': 'application/json' }, body: JSON.stringify(formData) }).then(res => res.json().then(d => console.log(d))).catch(e => console.error(e));
};

const uiSchema = {
  id: {"ui:widget": "hidden"}
}

const App = ({ schema }) => {
  return (
    <div>
      <nav>Hello</nav>
      <div style={{ margin: '0 auto', width: 1000 }}>
        <Form
          schema={schema}
          uiSchema={uiSchema}
          formData={{}}
          onChange={() => console.log('change')}
          onError={() => console.log('error')}
          onSubmit={create}
          fields={fields}
        >
          <button type="submit">Create</button>
          <button type="button">Cancel</button>
        </Form>
      </div>
    </div>
  );
};


export default App;
