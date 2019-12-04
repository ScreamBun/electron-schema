import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
  Button,
  ButtonGroup
} from 'reactstrap'

import Form from 'react-jsonschema-form-bs4'
import '@fortawesome/fontawesome-free/css/all.css'

import {
  dataSchema,
  uiSchema
} from './form.schema'

import oc2ls from '../../resources/oc2ls-v1_0_1.keys.json'
// import oc2ls from '../../resources/oc2ls-v1_0_1.simple.jadn'

import {
  ArrayTemplate,
  CustomFields,
  FieldTemplate,
  ObjectTemplate,
} from './components'

class GenerateSchema extends Component {
  constructor(props, context) {
    super(props, context)
    this.log = (type) => console.log.bind(console, type)
    console.log(oc2ls)
  }

  render() {
    return (
      <div className="row mx-auto mb-5">
        <div className="col-12">
          <p>TEST GENERATE SCHEMA</p>
          <Form
            schema={ dataSchema }
            uiSchema={ uiSchema }
            formData={ oc2ls }
            fields={ CustomFields }
            // FieldTemplate={ FieldTemplate }
            // ArrayFieldTemplate={ ArrayTemplate }
            // ObjectFieldTemplate={ ObjectTemplate }
            onChange={ this.log("changed") }
            onSubmit={ this.log("submitted") }
            onError={ this.log("errors") }
            // className='form-inline'
          >
            <div className='col-12'>
              <ButtonGroup className='float-right'>
                <Button color="primary" type="submit">Save</Button>
                <Button color="danger" type="button">Cancel</Button>
              </ButtonGroup>
            </div>
          </Form>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
})

export default connect(mapStateToProps)(GenerateSchema)
