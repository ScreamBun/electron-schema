import React, { Component } from 'react'

import {
  Button,
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Table
} from 'reactstrap'

import $ from 'jquery'

import TypeOptionsEditor from './options_object'
import FieldOptionsEditor from './fields_object'

class OptionsModal extends Component {
  constructor(props) {
    super(props);

    this.serializeOptionsData = this.serializeOptionsData.bind(this);
    this.saveModal = this.saveModal.bind(this);
    this.deserializeOptionsData = this.deserializeOptionsData.bind(this);
    this.saveModalState = this.saveModalState.bind(this);

    // 'rehydrate' (not using Redux for now) this state component with existing options, else create empty modal
    this.state = this.deserializeOptionsData(this.props.values)
  }

  // convert array into options data state object 
  deserializeOptionsData(options_array) {
    return { 
      type : {},
      field : {}
    }
  }

  // convert options data state object into formatted str
  serializeOptionsData(state_obj) {
    let options = '';

    for(let key in state_obj.type) {
      if(key == 'id' && state_obj.type[key] && state_obj.type[key][0].value) {
        options += '=, ';
      } else if(key == 'vtype' && state_obj.type[key]) {
        options += '*' + state_obj.type[key] + ', ';
      } else if(key == 'ktype' && state_obj.type[key]) {
        options += '+' + state_obj.type[key] + ', ';
      } else if(key == 'enum' && state_obj.type[key]) {
        options += '#' + state_obj.type[key] + ', ';
      } else if(key == '(optional) format' && state_obj.type[key]) {
        options += '/' + state_obj.type[key] + ', ';
      } else if(key == '(optional) pattern' && state_obj.type[key]) {
        options += '%' + state_obj.type[key] + ', ';
      } else if(key == '(optional) minv' && state_obj.type[key]) {
        options += '{' + state_obj.type[key] + ', ';
      } else if(key == '(optional) maxv' && state_obj.type[key]) {
        options += '}' + state_obj.type[key] + ', ';
      } else if(key == '(optional) unique' && state_obj.type[key] && state_obj.type[key][0].value) {
        options += 'q, ';
      }
    }

    for(let key in state_obj.field) {
      if(key == 'minc' && state_obj.field[key]) {
        options += '[' + state_obj.field[key] + ', ';
      } else if(key == 'maxc' && state_obj.field[key]) {
        options += ']' + state_obj.field[key] + ', ';
      } else if(key == 'tfield' && state_obj.field[key]) {
        options += '&' + state_obj.field[key] + ', ';
      } else if(key == 'path' && state_obj.type[key] && state_obj.type[key][0].value) {
        options += '<' + state_obj.field[key] + ', ';
      } else if(key == 'default' && state_obj.field[key]) {
        options += '!' + state_obj.field[key] + ', ';
      }
    }

    return options.slice(0, -2);
  }

  saveModalState(state, type) {
    this.setState({
      [type] : state
    })
  }

  saveModal() {
    var data = this.serializeOptionsData(this.state);
    this.props.saveModal(data);
  }

  render() {
    return (
      <Modal size='xl' isOpen={ this.props.isOpen }>
      <ModalHeader> { this.props.fieldOptions ? 'Field Options' : 'Type Options' }</ModalHeader>
      <ModalBody>
        <FieldOptionsEditor deserializedState={ this.state } saveModalState={ this.saveModalState } fieldOptions={ this.props.fieldOptions }/>
        <TypeOptionsEditor deserializedState={ this.state } saveModalState={ this.saveModalState } />
      </ModalBody>
      <ModalFooter>
        <Button color='success' onClick={ this.saveModal }>Set</Button>
        <Button color='secondary' onClick={ this.props.toggleModal }>Close</Button>
      </ModalFooter>
    </Modal>
    )
  } 
}

export default OptionsModal