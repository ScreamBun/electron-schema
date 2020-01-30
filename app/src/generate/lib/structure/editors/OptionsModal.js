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

    this.deserializeOptionsData = this.deserializeOptionsData.bind(this);
    this.serializeOptionsData = this.serializeOptionsData.bind(this);
    this.saveModal = this.saveModal.bind(this);
    this.saveModalState = this.saveModalState.bind(this);

    this.state = this.deserializeOptionsData(this.props.optionValues)
  }

  // convert array into options data state object 
  deserializeOptionsData(options) {
    let obj = {
      type : {},
      field : {}
    };

    if(options !== undefined && options.length !== 0) {

      options.forEach((item, index, array) => {
        let key;
        let val;
        let optionType;

        const _symbol = item.charAt(0);
        const non_bools = ['*', '+', '#', '/', '%', '{', '}', '[', '], &', '!']

        if (_symbol == '=' || _symbol == 'q' || _symbol == '<') { 
          val = [{ value : true, label : 'Yes' }]; 
        } else if (non_bools.includes(_symbol)){
          val = item.substring(1);
        } 

        if(_symbol == '=') {
          optionType = 'type';
          key = 'id';
        } else if(_symbol == '*') {
          optionType = 'type';
          key = 'vtype';
        } else if(_symbol == '+') {
          optionType = 'type';
          key = 'ktype';
        } else if(_symbol == '#') {
          optionType = 'type';
          key = 'enum';
        } else if(_symbol == '/') {
          optionType = 'type';
          key = '(optional) format';
        } else if(_symbol == '%') {
          optionType = 'type';
          key = '(optional) pattern'
        } else if(_symbol == '{') {
          optionType = 'type';
          key = '(optional) minv'
        } else if(_symbol == '}') {
          optionType = 'type';
          key = '(optional) maxv';
        } else if(_symbol == 'q') {
          optionType = 'type';
          key = '(optional) unique';
        } else if(_symbol == '[') {
          optionType = 'field';
          key = 'minc';
        } else if(_symbol == ']') {
          optionType = 'field';
          key = 'maxc';
        } else if(_symbol == '&') {
          optionType = 'field';
          key = 'tfield';
        } else if(_symbol == '<') {
          optionType = 'field';
          key = 'path';
        } else if(_symbol == '!') {
          optionType = 'field';
          key = 'default';
        }
        obj[optionType][key] = val;
      });
    }

    return obj;
  }

  componentDidUpdate(previousProps, previousState) {
    if (previousProps.optionValues !== this.props.optionValues) {
      this.setState(this.deserializeOptionsData(this.props.optionValues))
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
      } else if(key == 'path' && state_obj.field[key] && state_obj.field[key][0].value) {
        options += '<, ';
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
        <FieldOptionsEditor deserializedState={ this.state.field } saveModalState={ this.saveModalState } fieldOptions={ this.props.fieldOptions }/>
        <TypeOptionsEditor deserializedState={ this.state.type } saveModalState={ this.saveModalState } />
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