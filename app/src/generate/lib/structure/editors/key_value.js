import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  ButtonGroup,
  FormGroup,
  FormText,
  Input,
  Label
} from 'reactstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMinusSquare } from '@fortawesome/free-solid-svg-icons'

// Key Value Editor
const KeyValueEditor = props => {
  const inputArgs = {
    value: props.value,
    checked: props.type && props.value ? true : false,
    onChange: e => props.change(e.target.value)
  };

  if (['checkbox', 'radio'].includes(props.type)) {
    inputArgs.onChange = e => props.change(e.target.checked);
  }

  return (
    <FormGroup row className='border m-1 p-1'>
      <Label for={ 'editor-' + props.id } sm={ 2 } ><strong>{ props.id }</strong></Label>
      <div className="input-group col-sm-10">
        <Input
          type={ props.type || "text" }
          id={ 'editor-' + props.id }
          className="form-control"
          placeholder={ props.placeholder }
          { ...inputArgs }
        />
        { props.removable ? (
          <div className="input-group-append">
            <Button color='danger' onClick={ () => props.remove(props.id.toLowerCase()) }>
              <FontAwesomeIcon icon={ faMinusSquare } />
            </Button>
          </div>
        ) : '' }
      </div>
      { props.description ? <FormText color='muted' className='ml-3'>{ props.description }</FormText> : '' }
    </FormGroup>
  );
}

KeyValueEditor.defaultProps = {
  id: PropTypes.string,
  placeholder: PropTypes.string,
  type: PropTypes.oneOf(['checkbox', 'color', 'date', 'datetime-local', 'email', 'file', 'hidden', 'image', 'month', 'number', 'password', 'radio', 'range', 'search', 'tel', 'text', 'time', 'url', 'week']),
  value: PropTypes.object,
  change: PropTypes.func,
  remove: PropTypes.func
}

KeyValueEditor.defaultProps = {
  id: 'KeyValueEditor',
  placeholder: 'KeyValueEditor',
  type: "text",
  value: '',
  change: val => {
    console.log(val)
  },
  remove: id => {
    console.log(id)
  },
  removable: true
}

export default KeyValueEditor