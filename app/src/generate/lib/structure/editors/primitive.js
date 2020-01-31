import React, { Component, useState, useEffect } from 'react'

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
class PrimitiveEditor extends Component {

  constructor(props) {
    super(props)

    this.state = {
      values: {
        name: '',
        type: '',
        options: [],
        comment: '',
      },
      modal : false
    }

    this.removeAll = this.removeAll.bind(this)
    this.onChange = this.onChange.bind(this)
    this.toggleModal = this.toggleModal.bind(this)
    this.saveModal = this.saveModal.bind(this)
  }

  componentDidMount() {
    this.initState()
  }

  initState() {
    if (this.props.value && typeof(this.props.value) === 'object') {
      let updateValues = {}
      if (this.props.value[0] !== this.state.values.name) updateValues.name = this.props.value[0]
      if (this.props.value[1] !== this.state.values.type) updateValues.type = this.props.value[1]
      if (this.props.value[2] !== this.state.values.options) updateValues.options = this.props.value[2]
      if (this.props.value[3] !== this.state.values.comment) updateValues.comment = this.props.value[3]

      if (Object.keys(updateValues).length > 0) {
        this.setState(prevState => ({
          values: {
            ...prevState.values,
            ...updateValues
          }
        }))
      }
    }
  }

  onChange(e) {
    let key = e.target.placeholder.toLowerCase()
    let value = e.target.value
    
    this.setState(prevState => ({
      values: {
        ...prevState.values,
        [key]: value
      }
    }), () => {
      if (this.props.change) {
        this.props.change(this.state.values, this.props.dataIndex)
      }
    })
  }

  removeAll(e) {
    this.props.remove(this.props.dataIndex)
  }

  toggleModal() {
    this.setState({
      modal: !this.state.modal
    });
  }

  saveModal(data) {
    this.toggleModal();

    this.setState(prevState => ({
      values: {
        ...prevState.values,
        options: data
      }
    }), () => {
      if (this.props.change) {
        this.props.change(this.state.values, this.props.dataIndex)
      }
    })
  }

  render() {
    return (
      <div className='border m-1 p-1'>
        <ButtonGroup size='sm' className='float-right'>
          <Button color='danger' onClick={ this.removeAll } >
            <FontAwesomeIcon icon={ faMinusCircle } />
          </Button>
        </ButtonGroup>

        <div className='border-bottom mb-2'>
          <h3 className='col-sm-10 my-1'>{ `${this.state.values.name}(${this.state.values.type})` }</h3>
        </div>

        <div className='row m-0'>
          <FormGroup className='col-md-4'>
            <Label>Name</Label>
            <Input type="string" placeholder="Name" value={ this.state.values.name } onChange={ this.onChange } />
          </FormGroup>

          <FormGroup className='col-md-4'>
              <Label>&nbsp;</Label>
              <InputGroup>
                <Button outline color='info' onClick={ this.toggleModal }>Type Options</Button>
                <OptionsModal optionValues={ this.state.values.options } isOpen={ this.state.modal } toggleModal={ this.toggleModal } saveModal={ this.saveModal } />
              </InputGroup>
            </FormGroup>

          <FormGroup className='col-md-4'>
            <Label>Comment</Label>
            <Input type="textarea" placeholder="Comment" rows={ 1 } value={ this.state.values.comment } onChange={ this.onChange } />
          </FormGroup>
        </div>
      </div>
    )
  }
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