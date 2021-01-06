import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ValidOptions } from 'jadnschema/lib/jadnschema/schema/options';

import KeyValueEditor from '../key_value';
import { safeGet } from '../../../../../utils';

const ConfigKeys = {
  id: {
    type: 'checkbox',
    description: 'If present, Enumerated values and fields of compound types are denoted by FieldID rather than FieldName'
  },
  vtype: {
    // TODO: change to select?
    description: 'Value type for ArrayOf and MapOf'
  },
  ktype: {
    // TODO: change to select?
    description: 'Key type for MapOf'
  },
  enum: {
    description: 'Extension: Enumerated type derived from the specified Array, Choice, Map or Record type'
  },
  pointer: {
    description: 'Extension: Enumerated type containing pointers derived from the specified Array, Choice, Map or Record type'
  },
  format: {
    description: '(optional) Semantic validation keyword'
  },
  pattern: {
    description: '(optional) Regular expression used to validate a String type'
  },
  minf: {
    type: 'number',
    description: '(optional) Minimum real number value'
  },
  maxf: {
    type: 'number',
    description: '(optional) Maximum real number value'
  },
  minv: {
    type: 'number',
    description: '(optional) Minimum numeric value, octet or character count, or element count'
  },
  maxv: {
    type: 'number',
    description: '(optional) Maximum numeric value, octet or character count, or element count'
  },
  unique: {
    type: 'checkbox',
    description: '(optional) If present, an ArrayOf instance must not contain duplicate values'
  },
  set: {
    type: 'checkbox',
    description: '(optional) If present, an ArrayOf instance is unordered and uniques'
  },
  unordered: {
    type: 'checkbox',
    description: '(optional) If present, an ArrayOf instance is unordered'
  },
  extend: {
    type: 'checkbox',
    description: '(optional) Type has an extension point where fields may be added'
  },
  default: {
    type: 'checkbox',
    description: '(optional) Default value'
  }
};

// Type Options Editor
const TypeOptionsEditor = props => {
  const {
    change, deserializedState, id, optionType, schemaTypes
  } = props;

  const getOptions = (key) => {
    switch (key) {
      case 'ktype':
        return [];
      case 'vtype':
        return schemaTypes;
      default:
        return [];
    }
  };

  const validOptions = () => {
    return safeGet(ValidOptions, optionType, []).map(key => {
      return (
        <KeyValueEditor
          key={ key }
          id={ key }
          { ...ConfigKeys[key] }
          placeholder={ key }
          removable={ false }
          options={ getOptions(key) }
          change={ val => change([key, val], 'type') }
          value={ deserializedState[key] }
        />
      );
    });
  };

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
};

TypeOptionsEditor.propTypes = {
  schemaTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  id: PropTypes.string,
  placeholder: PropTypes.string,
  change: PropTypes.func,
  deserializedState: PropTypes.object,
  optionType: PropTypes.string
};

TypeOptionsEditor.defaultProps = {
  id: 'Set Type Options',
  placeholder: 'Set Type Options',
  change: ([key, val], type) => null,  // eslint-disable-line no-unused-vars
  deserializedState: {},
  optionType: ''
};

const mapStateToProps = state => ({
  schemaTypes: [...state.jadn.baseTypes, ...Object.keys(state.jadn.schemaTypes)]
});

export default connect(mapStateToProps)(TypeOptionsEditor);
