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
  const {
    id,
    value,
    description,
    placeholder,
    type,
    change,
    remove
  } = props;
  const shadowless = [
    'checkbox',
    'file',
    'hidden',
    'image',
    'radio'
  ];

  const inputArgs = {
    value,
    checked: type && value,
    onChange: e => change(e.target.value)
  };

  if (['checkbox', 'radio'].includes(type)) {
    inputArgs.onChange = e => change(e.target.checked);
  }

  let removeBtn = '';
  if (remove) {
    removeBtn = (
      <div className="input-group-append">
        <Button color='danger' onClick={ () => remove(id.toLowerCase()) }>
          <FontAwesomeIcon icon={ faMinusSquare } />
        </Button>
      </div>
    );
  }

  return (
    <FormGroup row className="border m-1 p-1">
      <Label htmlFor={ `editor-${id}` } sm={ 2 } ><strong>{ id }</strong></Label>
      <div className="input-group col-sm-10">
        <Input
          type={ type || 'text' }
          id={ `editor-${id}` }
          className={ `form-control ${shadowless.includes(type) ? ' shadow-none' : ''}` }
          placeholder={ placeholder }
          { ...inputArgs }
        />
        { removeBtn }
      </div>
      { description ? <FormText color='muted' className='ml-3'>{ description }</FormText> : '' }
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
  change: (val) => null,  // eslint-disable-line no-unused-vars
  remove: (idx) => null  // eslint-disable-line no-unused-vars
};

export default KeyValueEditor;
