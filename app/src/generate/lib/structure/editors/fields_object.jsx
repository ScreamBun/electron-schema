import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import KeyValueEditor from './key_value';

const ConfigKeys = {
  minc: {
    description: 'Minimum cardinality'
  },
  maxc: {
    description: 'Maximum cardinality'
  },
  tfield: {
    description: 'Field that specifies the type of this field'
  },
  path: {
    description: 'Use FieldName as a qualifier for fields in FieldType',
    type: 'checkbox'
  },
  default: {
    description: 'Reserved for default value'
  }
};

// Key Object Editor
const KeyObjectEditor = props => {
  const [state, setState] = useState(props.deserializedState);

  const saveKeyValuePair = (key, val) => {
    setState(prevState => ({
      ...prevState,
      [key]: val
    }));
  };

  useEffect(() => {
    props.saveModalState(state, 'field');
  }, [state]);

  const keys = Object.keys(ConfigKeys).map(k => {
    const keyProps = {
      ...ConfigKeys[k],
      placeholder: k,
      removable: false,
      change: v => saveKeyValuePair(k, v)
    };

    return <KeyValueEditor value={ props.deserializedState[k] } key={ k } id={ k } { ...keyProps } />;
  });

  if (!props.fieldOptions) return null;

  return (
    <div className="border m-1 p-1">
      <div className="border-bottom mb-2">
        <p className="col-sm-4 my-1"><strong>{ props.id }</strong></p>
      </div>
      <div className="col-12 m-0">
        { keys }
      </div>
    </div>
  );
};

KeyObjectEditor.propTypes = {
  id: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.array,
  change: PropTypes.func,
  deserializedState: PropTypes.object,
  saveModalState: PropTypes.func,
  fieldOptions: PropTypes.bool.isRequired
};

KeyObjectEditor.defaultProps = {
  id: 'Set Field Options',
  placeholder: 'Set Field Options',
  value: [],
  change: null,
  deserializedState: {},
  saveModalState: null
};

export default KeyObjectEditor;
