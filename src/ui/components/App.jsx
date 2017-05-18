import React from 'react';
import Form from 'react-jsonschema-form';

const MyCustomWidget = (props) => {
  return (
    <input type="text"
      className="custom"
      value={props.value}
      required={props.required}
      onChange={(event) => props.onChange(event.target.value)} />
  );
};

const widgets = {
  myCustomWidget: MyCustomWidget
};

const CustomFieldTemplate = ({ children, schema }) => {
  return <div>{children}<a>Edit</a></div>

};

const CustomTitleField = ({title, required}) => {
  const legend = required ? title + '*' : title;
  return <div id="custom"><h4>{legend.toUpperCase()}</h4></div>;
};

const fields = {
  TitleField: CustomTitleField
};

const App = ({ data, schema }) => {
  const uiSchema = {
  "ui:options":  {
    addable: false,
    removable: false,
    orderable: false,
  },
  "ui:readonly": true,
    "ui:widget": "myCustomWidget"

};
  return (
    <div>
      <nav>Hello</nav>
      <div style={{ margin: '0 auto', width: 1000 }}>
        <Form
          liveValidate
          schema={schema}
          formData={data}
          uiSchema={uiSchema}
          onChange={() => console.log('change')}
          onError={() => console.log('error')}
          onSubmit={() => console.log('Submit')}
          fields={fields}
          FieldTemplate={CustomFieldTemplate}
        >
          <button type="submit">Create</button>
          <button type="button">Cancel</button>
        </Form>
      </div>
    </div>
  );
};


export default App;
