import React from 'react';
import Form from 'react-jsonschema-form';
import Create from './Create.jsx';
import Nav from './Nav.jsx';

const CustomTitleField = ({title, required}) => {
  const legend = required ? title + '*' : title;
  return <div id="custom"><h4>{legend.toUpperCase()}</h4></div>;
};

const fields = {
  TitleField: CustomTitleField
};

function ArrayFieldTemplate(props) {
  return (
    <div>
      <CustomTitleField {...props} />
      {props.items.map(element => element.children)}
    </div>
  );
}

const All = ({ data, schema, resource }) => {
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
      <Nav title={`/${resource}`} endpoint={`/${resource}/admin/new`} />
      <div style={{ margin: '0 auto', width: 1000 }}>
        {data.map(d => {
          return (
            <div style={{ marginBottom: 50, border: '2px solid grey', padding: 10 }}>
              <a href={`${d.id}/admin`}><h3>{`${d.id}/admin`}</h3></a>
              <Form
                liveValidate
                schema={schema}
                formData={d}
                uiSchema={uiSchema}
                fields={fields}
                ArrayFieldTemplate={ArrayFieldTemplate}
              >
              <a className="btn btn-info" href={`${d.id}/admin`}>Edit</a>
              </Form>
            </div>
          );
        })}
      </div>
    </div>
  );
};


export default All;
