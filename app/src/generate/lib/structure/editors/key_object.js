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

// Key Object Editor
class KeyObjectEditor extends Component {
  constructor(props, context) {
    super(props, context);

    this.removeAll = this.removeAll.bind(this)
    this.removeIndex = this.removeIndex.bind(this)
    this.addIndex = this.addIndex.bind(this)
    this.onChange = this.onChange.bind(this)

    this.state = {
      values: Object.keys(this.props.value).map(k => ({key: k, value: this.props.value[k]}) )
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    let propsChange = this.props != nextProps
    let stateChange = this.state != nextState

    if (this.state.values != nextState.values) {
      this.props.change(this.toObject(nextState.values))
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

  removeIndex(e) {
    if (this.state.values.length > 1) {
      let idx = parseInt(e.currentTarget.attributes.getNamedItem('data-index').value)

      this.setState(prevState => ({
        values: prevState.values.filter((row, i) => i !== idx)
      }));
    } else {
      console.log('cant remove')
    }
  }

  addIndex() {
    if (this.state.values.some(v => v[0] === '')) {
      return
    }
    console.log("Add KeyObject")

    this.setState(prevState => ({
      values: [
        ...prevState.values,
        {
          key: '',
          value: ''
        }
      ]
    }));
  }

  onChange(e) {
    let idx = parseInt(e.target.attributes.getNamedItem('data-index').value)
    let type = e.target.attributes.getNamedItem('data-type').value
    let val = e.target.value
    console.log("Update KeyObject")

    this.setState(prevState => {
      let tmpValues = [ ...prevState.values ]
      tmpValues[idx][type] = val
      return {
        values: tmpValues
      }
    });
  }

  render() {
    let indices = this.state.values.map((obj, i) => (
      <div className="input-group col-sm-12 mb-1" key={ i }>
        <Input
          type="text"
          className="form-control"
          data-index={ i }
          data-type='key'
          placeholder={ this.props.placeholder }
          value={ obj.key }
          onChange={ this.onChange }
        />
        <Input
          type="text"
          className="form-control"
          data-index={ i }
          data-type='value'
          placeholder={ this.props.placeholder }
          value={ obj.value }
          onChange={ this.onChange }
        />
        <div className="input-group-append">
          <Button color='danger' onClick={ this.removeIndex } data-index={ i }>
            <FontAwesomeIcon icon={ faMinusSquare } />
          </Button>
        </div>
      </div>
    ))

    return (
      <div className='border m-1 p-1'>
        <ButtonGroup size='sm' className='float-right'>
          <Button color='info' onClick={ this.addIndex } >
            <FontAwesomeIcon
              icon={ faPlusSquare }
            />
          </Button>
          <Button color='danger' onClick={ this.removeAll } >
            <FontAwesomeIcon icon={ faMinusCircle } />
          </Button>
        </ButtonGroup>
        <div className='border-bottom mb-2'>
          <p className='col-sm-4 my-1'><strong>{ this.props.id }</strong></p>
        </div>
        <div className='row m-0 indices'>
          { indices }
        </div>
      </div>
    )
  }
}

KeyObjectEditor.defaultProps = {
  id: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.object,
  change: PropTypes.func,
  remove: PropTypes.func
}

KeyObjectEditor.defaultProps = {
  id: 'KeyObjectEditor',
  placeholder: 'KeyObjectEditor',
  value: {},
  change: val => {
    console.log(val)
  },
  remove: id => {
    console.log(id)
  }
}

export default KeyObjectEditor