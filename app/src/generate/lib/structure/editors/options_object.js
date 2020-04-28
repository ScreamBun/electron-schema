import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import KeyValueEditor from './key_value';

const ConfigKeys = {
  id: {
    description: 'If present, Enumerated values and fields of compound types are denoted by FieldID rather than FieldName',
    type: 'checkbox'
  },
  vtype: {
    description: 'Value type for ArrayOf and MapOf'
  },
  ktype: {
    description: 'Key type for MapOf'
  },
  enum: {
    description: 'Extension: Enumerated type derived from the specified Array, Choice, Map or Record type'
  },
  format: {
    description: '(optional) Semantic validation keyword'
  },
  pattern: {
    description: '(optional) Regular expression used to validate a String type'
  },
  minv: {
    description: '(optional) Minimum numeric value, octet or character count, or element count'
  },
  maxv: {
    description: '(optional) Maximum numeric value, octet or character count, or element count'
  },
  unique: {
    description: '(optional) If present, an ArrayOf instance must not contain duplicate values',
    type: 'checkbox'
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
    props.saveModalState(state, 'type');
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
  saveModalState: PropTypes.func
};

KeyObjectEditor.defaultProps = {
  id: 'Set Type Options',
  placeholder: 'Set Type Options',
  value: [],
  change: null,
  deserializedState: {},
  saveModalState: null
};

export default KeyObjectEditor;
