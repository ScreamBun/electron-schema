import React, { Component, useState, useEffect } from 'react'

import {
  Button,
  ButtonGroup,
  FormGroup,
  Input,
  Label
} from 'reactstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMinusCircle,
  faMinusSquare,
  faPlusSquare
} from '@fortawesome/free-solid-svg-icons'

import KeyValueEditor from './key_value'

const ConfigKeys = {
  'minc': { 
    description: 'Minimum cardinality'
  },
  'maxc': { 
    description: 'Maximum cardinality'
  },
  'tfield': { 
    description: 'Field that specifies the type of this field'
  },
  'path': { 
    description: 'Use FieldName as a qualifier for fields in FieldType'
  },
  'default': { 
    description: 'Reserved for default value'
  },
}

// Key Object Editor
const KeyObjectEditor = (props) => {
  const [state, setState] = useState({});

  const removeAll = e => props.remove(props.id.toLowerCase())

  const onChange = e => {
    let index = e.target.attributes.getNamedItem('data-index').value.split(',')
    let value = e.target.value

    let tmpValue = [ ...props.value ]
    if (!tmpValue[index[0]]) {
      tmpValue[index[0]] = ['', '']
    }
    tmpValue[index[0]][index[1]] = value
    props.change(tmpValue)
  }

  const saveKeyValuePair = (keyVal) => {  
    setState(prevState => ({
      ...prevState,
      [keyVal[0]] : keyVal[1]
    }))
  }

  useEffect(() => {
    props.saveModalState(state, 'field');
  }, [state]) 

  const keys = Object.keys(ConfigKeys).map((key, idx) => {
    let keyProps = {
      ...ConfigKeys[key],
      placeholder: key,
      removable: false
    }
    if (props.value.hasOwnProperty(key)) {
      keyProps['value'] = props.value[key]
    } 

    const isDropdown = (key == 'path') ? true : false;

    return <KeyValueEditor value={ props.deserializedState[key] } saveKeyValuePair={ saveKeyValuePair } key={ idx } isDropdown={ isDropdown }  idx={ idx } id={ key } { ...keyProps } />
  })

  if(!props.fieldOptions) return null;

  return (
    <div className='border m-1 p-1'>
      <div className='border-bottom mb-2'>
        <p className='col-sm-4 my-1'><strong>{ props.id }</strong></p>
      </div>
      <div className='col-12 m-0'>
        { keys }
      </div>
    </div>
  )
}

KeyObjectEditor.defaultProps = {
  id: 'Set Field Options',
  placeholder: 'Set Field Options',
  value: [],
  // change: val => {
  //   console.log(val)
  // }
}

export default KeyObjectEditor