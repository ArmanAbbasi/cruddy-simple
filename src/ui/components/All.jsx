import React from 'react';
import Form from 'react-jsonschema-form';
import Create from './Create.jsx';


const CustomTitleField = ({title, required}) => {
  const legend = required ? title + '*' : title;
  return <div id="custom"><h4>{legend.toUpperCase()}</h4></div>;
};

const fields = {
  TitleField: CustomTitleField
};

const All = ({ data, schema }) => {
  const uiSchema = {
  "ui:options":  {
    addable: false,
    removable: false,
    orderable: false,
  },
  "ui:readonly": true
};
  return (
    <div>
      <Create schema={schema} />
      <nav>Photobox<button>New</button></nav>
      <div style={{ margin: '0 auto', width: 1000 }}>
        {data.map(d => {
          return <Form
            liveValidate
            schema={schema}
            formData={d}
            uiSchema={uiSchema}
            onChange={() => console.log('change')}
            onError={() => console.log('error')}
            onSubmit={() => console.log('Submit')}
            fields={fields}
          >
            <a href={`${d.id}/admin`}>Edit</a>
          </Form>
        })}
      </div>
    </div>
  );
};


export default All;
