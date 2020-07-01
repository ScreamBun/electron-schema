import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  FormGroup,
  FormText,
  Input,
  Label
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusSquare } from '@fortawesome/free-solid-svg-icons';

// Key Value Editor
const KeyValueEditor = props => {
  const inputArgs = {
    value: props.value,
    checked: props.type && props.value,
    onChange: e => props.change(e.target.value)
  };

  if (['checkbox', 'radio'].includes(props.type)) {
    inputArgs.onChange = e => props.change(e.target.checked);
  }

  let remove = '';
  if (props.remove) {
    remove = (
      <div className="input-group-append">
        <Button color='danger' onClick={ () => props.remove(props.id.toLowerCase()) }>
          <FontAwesomeIcon icon={ faMinusSquare } />
        </Button>
      </div>
    );
  }

  return (
    <FormGroup row className="border m-1 p-1">
      <Label htmlFor={ `editor-${props.id}` } sm={ 2 } ><strong>{ props.id }</strong></Label>
      <div className="input-group col-sm-10">
        <Input
          type={ props.type || 'text' }
          id={ `editor-${props.id}` }
          className="form-control"
          placeholder={ props.placeholder }
          { ...inputArgs }
        />
        { remove }
      </div>
      { props.description ? <FormText color='muted' className='ml-3'>{ props.description }</FormText> : '' }
    </FormGroup>
  );
};

KeyValueEditor.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.number,
    PropTypes.string
  ]),
  description: PropTypes.string,
  placeholder: PropTypes.string,
  type: PropTypes.oneOf([
    'checkbox',
    'color',
    'date',
    'datetime-local',
    'email',
    'file',
    'hidden',
    'image',
    'month',
    'number',
    'password',
    'radio',
    'range',
    'search',
    'tel',
    'text',
    'time',
    'url',
    'week'
  ]),
  change: PropTypes.func,
  remove: PropTypes.func
};

KeyValueEditor.defaultProps = {
  id: 'KeyValueEditor',
  name: 'KeyValueEditor',
  value: '',
  description: '',
  placeholder: 'KeyValueEditor',
  type: 'text',
  change: null,
  remove: null
};

export default KeyValueEditor;
