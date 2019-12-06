import React, { Component } from 'react'

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
  '$MaxBinary': {  // Integer{1..*} optional,
    description: 'Schema default maximum number of octets'
  },
  '$MaxString': {  // Integer{1..*} optional,
    description: 'Schema default maximum number of characters'
  },
  '$MaxElements': {  // Integer{1..*} optional,
    description: 'Schema default maximum number of items/properties'
  },
  '$FS': {  // String{1..1} optional,
    description: 'Field Separator character used in pathnames'
  },
  '$Sys': {  // String{1..1} optional,
    description: 'System character for TypeName'
  },
  '$TypeName': {  // String{1..127} optional,
    description: 'TypeName regex'
  },
  '$FieldName': {  // String{1..127} optional,
    description: 'FieldName regex'
  },
  '$NSID': {  // String{1..127} optional
    description: 'Namespace Identifier regex'
  }
}

// Key Object Editor
const KeyObjectEditor = (props) => {
  const removeAll = (e) => props.remove(props.id.toLowerCase())

  const onChange = (e) => {
    let index = e.target.attributes.getNamedItem('data-index').value.split(',')
    let value = e.target.value

    let tmpValue = [ ...props.value ]
    if (!tmpValue[index[0]]) {
      tmpValue[index[0]] = ['', '']
    }
    tmpValue[index[0]][index[1]] = value
    props.change(tmpValue)
  }

  return (
    <div className='border m-1 p-1'>
      <Button color='danger' size='sm' className='float-right' onClick={ removeAll } >
        <FontAwesomeIcon
          icon={ faMinusCircle }
        />
      </Button>
      <div className='border-bottom mb-2'>
        <p className='col-sm-4 my-1'><strong>{ props.id }</strong></p>
      </div>
      <div className='col-12 m-0'>
        { Object.keys(ConfigKeys).map((key, idx) => {
          let keyProps = {
            ...ConfigKeys[key],
            placeholder: key,
            removable: false
          }
          if (props.value.hasOwnProperty(key)) {
            keyProps['value'] = props.value[key]
          }
          return <KeyValueEditor key={ idx } id={ key } { ...keyProps } />
        }) }
      </div>
    </div>
  )
}

KeyObjectEditor.defaultProps = {
  id: 'ConfigObjectEditor',
  placeholder: 'ConfigObjectEditor',
  value: [],
  change: (val) => {
    console.log(val)
  },
  remove: (id) => {
    console.log(id)
  }
}

export default KeyObjectEditor