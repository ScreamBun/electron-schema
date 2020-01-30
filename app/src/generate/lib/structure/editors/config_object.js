import React, { Component } from 'react';
import PropTypes from 'prop-types';

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
    type: 'number',
    description: 'Schema default maximum number of octets'
  },
  '$MaxString': {  // Integer{1..*} optional,
    type: 'number',
    description: 'Schema default maximum number of characters'
  },
  '$MaxElements': {  // Integer{1..*} optional,
    type: 'number',
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
class KeyObjectEditor extends Component {
  constructor(props, context) {
    super(props, context);

    this.removeAll = this.removeAll.bind(this)

    this.state = {
      ...this.props.value
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    let propsChange = this.props != nextProps
    let stateChange = this.state != nextState

    if (this.state !== nextState) {
      this.props.change(nextState)
    }

    return propsChange || stateChange
  }

  toObject(val) {
    val = val ? val :  this.state.values
    return val.reduce((obj, row) => {
      obj[row.key] = row.value;
      return obj;
    }, {});
  }

  removeAll(e) {
    this.props.remove(this.props.id.toLowerCase())
  }

  onChange(k, v) {
    if (v === '') {
      delete this.state[k]
    } else {
      this.state[k] = v
    }
    this.setState(this.state)
  }

  render() {
    const keys = Object.keys(ConfigKeys).map((key, idx) => {
      let keyProps = {
        ...ConfigKeys[key],
        placeholder: key,
        change: v => this.onChange(key, v),
        removable: false
      }
      if (this.state.hasOwnProperty(key)) {
        keyProps['value'] = this.state[key]
      }
      return <KeyValueEditor key={ idx } id={ key } { ...keyProps } />
    })

    return (
      <div className='border m-1 p-1'>
        <Button color='danger' size='sm' className='float-right' onClick={ this.removeAll } >
          <FontAwesomeIcon
            icon={ faMinusCircle }
          />
        </Button>
        <div className='border-bottom mb-2'>
          <p className='col-sm-4 my-1'><strong>{ this.props.id }</strong></p>
        </div>
        <div className='col-12 m-0'>
          { keys }
        </div>
      </div>
    )
  }
}

KeyObjectEditor.propTypes = {
  id: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.object,
  change: PropTypes.func,
  remove: PropTypes.func
}

KeyObjectEditor.defaultProps = {
  id: 'ConfigObjectEditor',
  placeholder: 'ConfigObjectEditor',
  value: {},
  change: val => {
    console.log(val)
  },
  remove: id => {
    console.log(id)
  }
}

export default KeyObjectEditor