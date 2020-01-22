import React, { Component, useState } from 'react'

import {
  Button,
  ButtonGroup,
  FormGroup,
  Input,
  InputGroup,
  Label,
  Modal
} from 'reactstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMinusCircle,
  faMinusSquare,
  faPlusSquare
} from '@fortawesome/free-solid-svg-icons'

import OptionsModal from './OptionsModal'

// Primitive Editor
const PrimitiveEditor = props => {

  let [ isOpen, toggleModal ] = useState(false);
  let values = {}

  if (props.value && typeof(props.value) === 'object') {
    values = {
      name: props.value[0] || '',
      type: props.value[1] || '',
      options: props.value[2] || [],
      comment: props.value[3] || ''
    }
  }

  const removeAll = e => props.remove(props.dataIndex)

  const onChange = e => {
    let key = e.target.placeholder.toLowerCase()
    let value = e.target.value
    if (key === 'options') {
      value = value.split(/,\s+?/)
    }

    values[key] = value
    props.change(values, props.dataIndex)
  }

  return (
    <div className='border m-1 p-1'>
      <ButtonGroup size='sm' className='float-right'>
        <Button color='danger' onClick={ removeAll } >
          <FontAwesomeIcon icon={ faMinusCircle } />
        </Button>
      </ButtonGroup>

      <div className='border-bottom mb-2'>
        <h3 className='col-sm-10 my-1'>{ `${values.name}(${values.type})` }</h3>
      </div>

      <div className='row m-0'>
        <FormGroup className='col-md-4'>
          <Label>Name</Label>
          <Input type="string" placeholder="Name" value={ values.name } onChange={ onChange } />
        </FormGroup>

        <FormGroup className='col-md-4'>
            <Label>&nbsp;</Label>
            <InputGroup>
              <Button outline color='info' onClick={ () => toggleModal(!isOpen) }>Type Options</Button>
              <OptionsModal isOpen={ isOpen } toggleModal={ () => toggleModal(!isOpen) } />
            </InputGroup>
          </FormGroup>

        <FormGroup className='col-md-4'>
          <Label>Comment</Label>
          <Input type="textarea" placeholder="Comment" rows={ 1 } value={ values.comment } onChange={ onChange } />
        </FormGroup>
      </div>
    </div>
  )
}

PrimitiveEditor.defaultProps = {
  dataIndex: -1,
  values: {
    name: 'name',
    type: 'type',
    options: [],
    comment: ''
  },
  change: (vals, idx) => {
    console.log(vals, idx)
  },
  remove: idx => {
    console.log(idx)
  }

}

export default PrimitiveEditor