import React, { Component } from 'react'

import ReactMarkdown from 'react-markdown'

import {
  Button,
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter
} from 'reactstrap'

class OptionsModal extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const input = 
    `| ID | Label | Value | Definition |
    | --- | --- | --- | --- |
    |  **Structural** | | | |
    | 0x3d \`'='\` | id | none | If present, Enumerated values and fields of compound types are denoted by FieldID rather than FieldName ([Section 3.2.1.1](#3211-field-identifiers)) |
    | 0x2a \`'*'\` | vtype | String | Value type for ArrayOf and MapOf ([Section 3.2.1.2](#3212-value-type)) |
    | 0x2b \`'+'\` | ktype | String | Key type for MapOf ([Section 3.2.1.3](#3213-key-type)) |
    | 0x23 \`'#'\` | enum | String | Extension: Enumerated type derived from the specified Array, Choice, Map or Record type ([Section 3.3.3](#333-derived-enumerations)) |
    | **Validation** | | | |
    | 0x2f \`'/'\` | format | String | Semantic validation keyword from [Section 3.2.1.5](#3215-semantic-validation) |
    | 0x25 \`'%'\` | pattern | String | Regular expression used to validate a String type ([Section 3.2.1.6](#3216-pattern)) |
    | 0x7b \`'{'\` | minv | Integer | Minimum numeric value, octet or character count, or element count ([Section 3.2.1.7](#3217-size-and-value-constraints)) |
    | 0x7d \`'}'\` | maxv | Integer | Maximum numeric value, octet or character count, or element count |
    | 0x71 \`'q'\` | unique | none | If present, an ArrayOf instance must not contain duplicate values |
    **Notes**
    * TypeOptions MUST contain zero or one instance of each type option.
    * TypeOptions MUST contain only TypeOptions allowed for BaseType as shown in Table 3-3.
    * If BaseType is ArrayOf, TypeOptions MUST include the *vtype* option.
    * If BaseType is MapOf, TypeOptions MUST include *ktype* and *vtype* options.`

    return (
      <Modal size='xl' isOpen={ this.props.isOpen }>
      <ModalHeader>Options Dictionary</ModalHeader>
      <ModalBody>
        <ReactMarkdown source={input} />
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={ this.props.toggleModal }>Close</Button>
      </ModalFooter>
    </Modal>
    )
  } 
}

export default OptionsModal