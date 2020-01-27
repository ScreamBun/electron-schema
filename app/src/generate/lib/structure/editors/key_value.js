import React, { useState, useEffect } from 'react'

import {
  Button, 
  ButtonGroup,
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
  FormGroup, 
  FormText,
  Input, 
  Label,
} from 'reactstrap'

import Select from 'react-dropdown-select'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMinusSquare } from '@fortawesome/free-solid-svg-icons'

// Key Value Editor
const KeyValueEditor = props => {
  const options = [
    { value: '', label: 'Select...' },
    { value: true, label: 'Yes' },
    { value: false, label: 'No' },
  ];
  const [ inputValue, handleInputChange ] = useState(props.value);
  const [ selectValue, handleSelectChange ] = props.value ? useState([props.value]) : useState([options[0]]);

  const getKeyValuePair = (type) => {
    return type == 'select' ? [props.id, selectValue] : [props.id, inputValue];
  };

  useEffect(() => {
    props.saveKeyValuePair(getKeyValuePair('select'));
  }, [selectValue]);

  useEffect(() => {
    props.saveKeyValuePair(getKeyValuePair('input'));
  }, [inputValue]);

  return (
    <FormGroup row className='border m-1 p-1'>
    <Label for={ 'editor-' + props.idx } sm={ 2 } ><strong>{ props.id }</strong></Label>
    <div className='input-group col-sm-10'>
      { props.isDropdown ? 
        <Select
          options={ options } 
          onChange={ value => handleSelectChange(value) }
          values={ selectValue }
        />
        : 
        <Input
          type='text'
          id={ 'editor-' + props.idx }
          className='form-control'
          placeholder={ props.placeholder }
          value={ inputValue }
          onChange={ e => handleInputChange(e.target.value) }
        />  
      }
      { props.removable ? (
        <div className='input-group-append'>
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
  id: 'KeyValueEditor',
  placeholder: 'KeyValueEditor',
  value: '',
  remove: id => {
    console.log(id)
  },
  removable: true
}

export default KeyValueEditor;  