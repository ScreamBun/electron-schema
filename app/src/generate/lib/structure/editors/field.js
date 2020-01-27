import React, { Component, useState, useEffect } from 'react'

import {
  Button,
  ButtonGroup,
  FormGroup,
  Input,
  Label
} from 'reactstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import OptionsModal from './OptionsModal'

import {
  faMinusCircle,
  faMinusSquare,
  faPlusSquare
} from '@fortawesome/free-solid-svg-icons'

export const StandardField = {
  id: 1,
  name: 'name',
  type: '',
  options: [],
  comment: ''
}

export const EnumeratedField = {
  id: 1,
  value: 'value',
  comment: ''
}

// Field Editor
class FieldEditor extends Component {
  constructor(props) {
    super(props);

    this.removeAll = this.removeAll.bind(this)
    this.onChange = this.onChange.bind(this)
    this.toggleModal = this.toggleModal.bind(this)
    this.saveModal = this.saveModal.bind(this)

    this.state = {
      values: {
        name: '',
        type: '',
        options: [],
        comment: '',
      },
      modal : false
    }
  }

  componentDidMount() {
    this.initState()
  }

  initState() {
    if (this.props.value && typeof(this.props.value) === 'object') {

    this.state.values.id = this.props.value[0] || 0

    if (this.props.enumerated) {
      this.state.values.value = this.props.value[1] || ''
      this.state.values.comment = this.props.value[2] || ''
    } else {
      this.state.values.name = this.props.value[1] || ''
      this.state.values.type = this.props.value[2] || ''
      this.state.values.options = this.props.value[3] || []
      this.state.values.comment = this.props.value[4] || ''
    }
  }

  removeAll(e) {
    this.props.remove(this.props.dataIndex)
  }

  toggleModal() {
    this.setState({
      modal : !this.state.modal
    });
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
        let tmpVals = Object.values(this.state.values)
        tmpVals[0] = Number(tmpVals[0])
        this.props.change(tmpVals, this.props.dataIndex)
      }
    })
  }

  saveModal(data) {
    this.toggleModal();

    data = data.split(/,\s+?/);

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
      <div className='col-sm-12 border m-1 p-1'>
        <ButtonGroup size='sm' className='float-right'>
          <Button color='danger' onClick={ this.removeAll } >
            <FontAwesomeIcon icon={ faMinusCircle } />
          </Button>
        </ButtonGroup>

        <div className='border-bottom mb-2'>
          <p className='col-sm-4 my-1'><strong>{ this.props.enumerated ? this.state.values.value : this.state.values.name }</strong></p>
        </div>

        <div className='row m-0'>
          <FormGroup className={ this.props.enumerated ? 'col-md-4' : 'col-md-3' }>
            <Label>ID</Label>
            <Input type='string' placeholder='ID' value={ this.state.values.id } onChange={ this.onChange } />
          </FormGroup>
          { this.props.enumerated ? (
            <FormGroup className='col-md-4'>
              <Label>Value</Label>
              <Input type='string' placeholder='Value' value={ this.state.values.value } onChange={ this.onChange } />
            </FormGroup>
            ) : (
              <div className='col-md-9 p-0 m-0'>
                <FormGroup className='col-md-4 d-inline-block'>
                  <Label>Name</Label>
                  <Input type='string' placeholder='Name' value={ this.state.values.name } onChange={ this.onChange } />
                </FormGroup>

                <FormGroup className='col-md-4 d-inline-block'>
                  <Label>Type</Label>
                  <Input type='string' placeholder='Type' value={ this.state.values.type } onChange={ this.onChange } />
                </FormGroup>

                <FormGroup className='col-md-4 d-inline-block'>
                  <Button outline color='info' onClick={ this.toggleModal }>Field Options</Button>
                  <OptionsModal saveModal={ this.saveModal } isOpen={ this.state.modal } toggleModal={ this.toggleModal } fieldOptions={ true } />
                </FormGroup>
              </div>
            )
          }
          <FormGroup className={ this.props.enumerated ? 'col-md-4' : 'col-md-12' }>
            <Label>Comment</Label>
            <Input type='textarea' placeholder='Comment' rows={ 1 } value={ this.state.values.comment } onChange={ this.onChange } />
          </FormGroup>
        </div>
      </div>
    )
  }
}

FieldEditor.defaultProps = {
  enumerated: false,
  dataIndex: -1,
  values: [],
  change: (vals, idx) => {
    console.log(vals, idx)
  },

  remove: idx => {
    console.log(idx)
  }
}

export default FieldEditor  