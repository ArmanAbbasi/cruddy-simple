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

const update = ({ formData }) => {
  const { id, ...data } = formData;
  fetch(`/group/${id}`, { method: 'PUT', headers: { 'Content-type': 'application/json' }, body: JSON.stringify(data) }).then(res => res.json().then(d => console.log(d))).catch(e => console.error(e));
};

const remove = (id) => () => {
  fetch(`/group/${id}`, { method: 'DELETE' }).then(res => res.json().then(d => console.log(d))).catch(e => console.error(e));
};

const uiSchema = {
    id: {"ui:readonly": true}
}
const Single = ({ data, schema }) => {
  console.log('*'.repeat(1000))
  return (
    <div>
      <nav>Photobox</nav>
      <div style={{ margin: '0 auto', width: 1000 }}>
        <Form
          liveValidate
          schema={schema}
          uiSchema={uiSchema}
          formData={data}
          onChange={() => console.log('change')}
          onError={() => console.log('error')}
          fields={fields}
        >
          <button type="submit" onSubmit={update}>Update</button>
          <button onClick={remove(data.id)}>Delete</button>
        </Form>
      </div>
    </div>
  );
};


export default Single;
