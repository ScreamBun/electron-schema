import React from 'react';
import PropTypes from 'prop-types';
import KeyValueEditor from '../key_value';

const ConfigKeys = {
  minc: {
    type: 'number',
    description: 'Minimum cardinality'
  },
  maxc: {
    type: 'number',
    description: 'Maximum cardinality'
  },
  tagid: {
    // type: ...
    description: 'Field containing an explicit tag for this Choice type'
  },
  dir: {
    type: 'checkbox',
    description: 'Use FieldName as a qualifier for fields in FieldType'
  },
  key: {
    type: 'checkbox',
    description: 'Field is a primary key for this type'
  },
  link: {
    type: 'checkbox',
    description: 'Field is a relationship link to a type instance'
  }
};

// Field Options Editor
const FieldOptionsEditor = props => {
  const {
    change, deserializedState, fieldOptions, id
  } = props;

  const validOptions = () => {
    return Object.keys(ConfigKeys).map(key => {
      return (
        <KeyValueEditor
          key={ key }
          id={ key }
          { ...ConfigKeys[key] }
          placeholder={ key }
          removable={ false }
          change={ val => change([key, val], 'field') }
          value={ deserializedState[key] }
        />
      );
    });
  };

  if (fieldOptions) {
    return (
      <div className="border m-1 p-1">
        <div className="border-bottom mb-2">
          <p className="col-sm-4 my-1"><strong>{ id }</strong></p>
        </div>
        <div className="col-12 m-0">
          { validOptions() }
        </div>
      </div>
    );
  }
  return '';
};

FieldOptionsEditor.propTypes = {
  fieldOptions: PropTypes.bool.isRequired,
  id: PropTypes.string,
  placeholder: PropTypes.string,
  change: PropTypes.func,
  deserializedState: PropTypes.object
};

FieldOptionsEditor.defaultProps = {
  id: 'Set Field Options',
  placeholder: 'Set Field Options',
  change: (val, type) => null,  // eslint-disable-line no-unused-vars
  deserializedState: {}
};

export default FieldOptionsEditor;
