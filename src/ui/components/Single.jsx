import fetch from 'isomorphic-fetch'
import React from 'react';
import Form from 'react-jsonschema-form';

import Nav from './Nav.jsx';

const CustomTitleField = ({title, required}) => {
  const legend = required ? title + '*' : title;
  return <div id="custom"><h4>{legend.toUpperCase()}</h4></div>;
};

const fields = {
  TitleField: CustomTitleField
};

const update = (resource) => ({ formData }) => {
  const { id, ...data } = formData;
  fetch(`/${resource}/${id}`, { method: 'PUT', headers: { 'Content-type': 'application/json' }, body: JSON.stringify(data) }).then(res => res.json().then(d => console.log(d))).catch(e => console.error(e));
};

const remove = (resource, id) => () => {
  fetch(`/${resource}/${id}`, { method: 'DELETE' }).then(res => res.json().then(d => console.log(d))).catch(e => console.error(e));
};

const uiSchema = {
    id: {"ui:readonly": true}
}
const Single = ({ data, schema, resource }) => {
  return (
    <div>
      <Nav title={`/${resource}/${data.id}`} endpoint={`/${resource}/admin/new`} />
      <div style={{ margin: '0 auto', width: 1000 }}>
        <Form
          liveValidate
          schema={schema}
          uiSchema={uiSchema}
          formData={data}
          onSubmit={update(resource)}
          fields={fields}
        >
          <button className="btn btn-info" type="submit">Update</button>
        </Form>
        <button className="btn btn-danger" onClick={remove(resource, data.id)}>Delete</button>
      </div>
    </div>
  );
};


export default Single;
