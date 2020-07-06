import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { opts2arr, opts2obj, OptionTypes } from 'jadnschema/lib/jadnschema/schema/options';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap';

import TypeOptionsEditor from './type_opts';
import FieldOptionsEditor from './field_opts';
import { objectFromTuple } from '../../../../../utils';

class OptionsModal extends Component {
  constructor(props, context) {
    super(props, context);
    this.saveModal = this.saveModal.bind(this);
    this.saveOptions = this.saveOptions.bind(this);

    const { optionValues } = this.props;
    this.state = {
      ...this.deserializeOptions(optionValues)
    };
  }

  // convert array into options data state object
  // eslint-disable-next-line class-methods-use-this
  deserializeOptions(options) {
    const opts = opts2obj(options);
    return {
      field: objectFromTuple(...OptionTypes.field.map(opt => opt in opts ? [opt, opts[opt]] : [] )),
      type: objectFromTuple(...OptionTypes.type.map(opt => opt in opts ? [opt, opts[opt]] : [] ))
    };
  }

  // convert options data state object into formatted array
  serializeOptions() {
    const { field, type } = this.state;
    return [
      ...opts2arr(type),  // Type Options
      ...opts2arr(field)  // Field Options
    ];
  }

  saveOptions(state, type) {
    this.setState(prevState => ({
      [type]: {
        ...prevState[type],
        [state[0]]: state[1]
      }
    }));
  }

  saveModal() {
    const { saveModal } = this.props;
    saveModal(this.serializeOptions());
  }

  render() {
    const {
      fieldOptions, isOpen, optionType, toggleModal
    } = this.props;
    const { field, type } = this.state;
    return (
      <Modal size="xl" isOpen={ isOpen }>
        <ModalHeader>
          { fieldOptions ? 'Field' : 'Type' }
          &nbsp;
          Options
        </ModalHeader>
        <ModalBody>
          <FieldOptionsEditor
            deserializedState={ field }
            change={ this.saveOptions }
            fieldOptions={ fieldOptions }
          />
          <TypeOptionsEditor
            deserializedState={ type }
            change={ this.saveOptions }
            optionType={ optionType }
          />
        </ModalBody>
        <ModalFooter>
          <Button color="success" onClick={ this.saveModal }>Save</Button>
          <Button color="secondary" onClick={ toggleModal }>Close</Button>
        </ModalFooter>
      </Modal>
    );
  }
}

OptionsModal.propTypes = {
  toggleModal: PropTypes.func.isRequired,
  saveModal: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  fieldOptions: PropTypes.bool,
  optionValues: PropTypes.array,
  optionType: PropTypes.string
};

OptionsModal.defaultProps = {
  optionType: '',
  optionValues: [],
  fieldOptions: false
};

export default OptionsModal;
