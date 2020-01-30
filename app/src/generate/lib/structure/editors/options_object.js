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
  'id': { 
    description: 'If present, Enumerated values and fields of compound types are denoted by FieldID rather than FieldName'
  },
  'vtype': { 
    description: 'Value type for ArrayOf and MapOf'
  },
  'ktype': { 
    description: 'Key type for MapOf'
  },
  'enum': { 
    description: 'Extension: Enumerated type derived from the specified Array, Choice, Map or Record type'
  },
  '(optional) format': { 
    description: 'Semantic validation keyword'
  },
  '(optional) pattern': { 
    description: 'Regular expression used to validate a String type'
  },
  '(optional) minv': { 
    description: 'Minimum numeric value, octet or character count, or element count'
  },
  '(optional) maxv': { 
    description: 'Maximum numeric value, octet or character count, or element count'
  },
  '(optional) unique': { 
    description: 'If present, an ArrayOf instance must not contain duplicate values'
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
    props.saveModalState(state, 'type');
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

    const isDropdown = (key == 'id' || key == '(optional) unique') ? true : false;

    return <KeyValueEditor value={ props.deserializedState[key] } saveKeyValuePair={ saveKeyValuePair } isDropdown={ isDropdown } key={ idx } id={ key } { ...keyProps } />
  })

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
  id: 'Set Type Options',
  placeholder: 'Set Type Options',
  value: [],
  change: val => {
    console.log(val)
  }
};

export default KeyObjectEditor;