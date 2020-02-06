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
  constructor(props, context) {
    super(props, context);

    this.deserializeOptionsData = this.deserializeOptionsData.bind(this);
    this.serializeOptionsData = this.serializeOptionsData.bind(this);
    this.saveModal = this.saveModal.bind(this);
    this.saveModalState = this.saveModalState.bind(this);

    this.state = this.deserializeOptionsData(this.props.optionValues);
  }

  // convert array into options data state object
  deserializeOptionsData(options) {
    const obj = {
      type: {},
      field: {}
    };

    if (options !== undefined && options.length !== 0 && options[0] !== '') {
      options.forEach((item, index, array) => {
        let key;
        let optionType;

        const _symbol = item.charAt(0);
        const val = ['=', 'q', '<'].includes(_symbol) ? true : item.substring(1);

        if (_symbol === '=') {
          optionType = 'type';
          key = 'id';
        } else if (_symbol === '*') {
          optionType = 'type';
          key = 'vtype';
        } else if (_symbol === '+') {
          optionType = 'type';
          key = 'ktype';
        } else if (_symbol === '#') {
          optionType = 'type';
          key = 'enum';
        } else if (_symbol === '/') {
          optionType = 'type';
          key = 'format';
        } else if (_symbol === '%') {
          optionType = 'type';
          key = 'pattern'
        } else if (_symbol === '{') {
          optionType = 'type';
          key = 'minv'
        } else if (_symbol === '}') {
          optionType = 'type';
          key = 'maxv';
        } else if (_symbol === 'q') {
          optionType = 'type';
          key = 'unique';
        } else if (_symbol === '[') {
          optionType = 'field';
          key = 'minc';
        } else if (_symbol === ']') {
          optionType = 'field';
          key = 'maxc';
        } else if (_symbol === '&') {
          optionType = 'field';
          key = 'tfield';
        } else if (_symbol === '<') {
          optionType = 'field';
          key = 'path';
        } else if (_symbol === '!') {
          optionType = 'field';
          key = 'default';
        }
        obj[optionType][key] = val;
      });
    }
    return obj;
  }

  // convert options data state object into formatted array
  serializeOptionsData(state_obj) {
  // eslint-disable-next-line array-callback-return
    const type_opts = Object.entries(state_obj.type).map(([key, val]) => {
      if (!val) return;
      if (key === 'id') {
        return '=';
      } else if (key === 'vtype') {
        return `*${val}`;
      } else if (key === 'ktype') {
        return `+${val}`;
      } else if (key === 'enum') {
        return `#${val}`;
      } else if (key === 'format') {
        return `/${val}`;
      } else if (key === 'pattern') {
        return `%${val}`;
      } else if (key === 'minv') {
        return `{${val}`;
      } else if (key === 'maxv') {
        return `}${val}`;
      } else if (key === 'unique') {
        return 'q';
      }
    }).filter(v => v);

    // eslint-disable-next-line array-callback-return
    const field_opts = Object.entries(state_obj.field).map(([key, val]) => {
      if (!val) return;
      if (key === 'minc') {
        return `[${val}`;
      } else if (key === 'maxc') {
        return `]${val}`;
      } else if (key === 'tfield') {
        return `&${val}`;
      } else if (key === 'path') {
        return '<';
      } else if (key === 'default') {
        return `!${val}`;
      }
    }).filter(v => v);
    return [ ...type_opts, ...field_opts ];
  }

  saveModalState(state, type) {
    this.setState({
      [type]: state
    });
  }

  saveModal() {
    const data = this.serializeOptionsData(this.state);
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
  isOpen: PropTypes.bool.isRequired
};

OptionsModal.defaultProps = {
};

export default OptionsModal;
