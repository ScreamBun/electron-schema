import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap';

import TypeOptionsEditor from './options_object';
import FieldOptionsEditor from './fields_object';

class OptionsModal extends Component {
  // convert array into options data state object
  static deserializeOptionsData(options) {
    const obj = {
      type: {},
      field: {}
    };

    if (options !== undefined && options.length !== 0 && options[0] !== '') {
      options.forEach(item => {
        let key;
        let optionType;

        const symbol = item.charAt(0);
        const val = ['=', 'q', '<'].includes(symbol) ? true : item.substring(1);

        if (symbol === '=') {
          optionType = 'type';
          key = 'id';
        } else if (symbol === '*') {
          optionType = 'type';
          key = 'vtype';
        } else if (symbol === '+') {
          optionType = 'type';
          key = 'ktype';
        } else if (symbol === '#') {
          optionType = 'type';
          key = 'enum';
        } else if (symbol === '/') {
          optionType = 'type';
          key = 'format';
        } else if (symbol === '%') {
          optionType = 'type';
          key = 'pattern';
        } else if (symbol === '{') {
          optionType = 'type';
          key = 'minv';
        } else if (symbol === '}') {
          optionType = 'type';
          key = 'maxv';
        } else if (symbol === 'q') {
          optionType = 'type';
          key = 'unique';
        } else if (symbol === '[') {
          optionType = 'field';
          key = 'minc';
        } else if (symbol === ']') {
          optionType = 'field';
          key = 'maxc';
        } else if (symbol === '&') {
          optionType = 'field';
          key = 'tfield';
        } else if (symbol === '<') {
          optionType = 'field';
          key = 'path';
        } else if (symbol === '!') {
          optionType = 'field';
          key = 'default';
        }
        obj[optionType][key] = val;
      });
    }
    return obj;
  }

  // convert options data state object into formatted array
  static serializeOptionsData(stateObject) {
  // eslint-disable-next-line array-callback-return
    const typeOptions = Object.entries(stateObject.type).map(([key, val]) => {
      if (!val) return;
      if (key === 'id') return '=';
      if (key === 'vtype') return `*${val}`;
      if (key === 'ktype') return `+${val}`;
      if (key === 'enum') return `#${val}`;
      if (key === 'format') return `/${val}`;
      if (key === 'pattern') return `%${val}`;
      if (key === 'minv') return `{${val}`;
      if (key === 'maxv') return `}${val}`;
      if (key === 'unique') return 'q';
    }).filter(v => v);

    // eslint-disable-next-line array-callback-return
    const fieldOptions = Object.entries(stateObject.field).map(([key, val]) => {
      if (!val) return;
      if (key === 'minc') return `[${val}`;
      if (key === 'maxc') return `]${val}`;
      if (key === 'tfield') return `&${val}`;
      if (key === 'path') return '<';
      if (key === 'default')  return `!${val}`;
    }).filter(v => v);

    return [ ...typeOptions, ...fieldOptions ];
  }

  constructor(props, context) {
    super(props, context);
    this.saveModal = this.saveModal.bind(this);
    this.saveModalState = this.saveModalState.bind(this);
    this.state = OptionsModal.deserializeOptionsData(this.props.optionValues);
  }

  saveModalState(state, type) {
    this.setState({
      [type]: state
    });
  }

  saveModal() {
    const data = OptionsModal.serializeOptionsData(this.state);
    this.props.saveModal(data);
  }

  render() {
    return (
      <Modal size="xl" isOpen={ this.props.isOpen }>
      <ModalHeader> { this.props.fieldOptions ? 'Field Options' : 'Type Options' }</ModalHeader>
      <ModalBody>
        <FieldOptionsEditor
          deserializedState={ this.state.field }
          saveModalState={ this.saveModalState }
          fieldOptions={ this.props.fieldOptions }
        />
        <TypeOptionsEditor deserializedState={ this.state.type } saveModalState={ this.saveModalState } />
      </ModalBody>
      <ModalFooter>
        <Button color="success" onClick={ this.saveModal }>Set</Button>
        <Button color="secondary" onClick={ this.props.toggleModal }>Close</Button>
      </ModalFooter>
    </Modal>
    );
  }
}

OptionsModal.propTypes = {
  toggleModal: PropTypes.func.isRequired,
  saveModal: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  optionValues: PropTypes.array,
  fieldOptions: PropTypes.bool
};

OptionsModal.defaultProps = {
  optionValues: [],
  fieldOptions: false
};

export default OptionsModal;
