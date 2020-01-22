import React, { Component } from 'react'

import {
  Button,
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Table
} from 'reactstrap'

import TypeOptionsEditor from './options_object'
import FieldOptionsEditor from './fields_object'

class OptionsModal extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Modal size='xl' isOpen={ this.props.isOpen }>
      <ModalHeader> { this.props.fieldOptions ? 'Field Options' : 'Type Options' }</ModalHeader>
      <ModalBody>
        <FieldOptionsEditor fieldOptions={ this.props.fieldOptions }/>
        <TypeOptionsEditor />
      </ModalBody>
      <ModalFooter>
        <Button color="success" onClick={ this.props.toggleModal }>Set</Button>
        <Button color="secondary" onClick={ this.props.toggleModal }>Close</Button>
      </ModalFooter>
    </Modal>
    )
  } 
}

export default OptionsModal