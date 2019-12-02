import React, { Component } from 'react'
import { connect } from 'react-redux'

import Form from 'react-jsonschema-form'
import {
  dataSchema,
  uiSchema
} from './form.schema'

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
  }

  render() {
    return (
      <div className="row mx-auto">
        <div className="col-12">
          <p>TEST GENERATE SCHEMA</p>
          <Form
            schema={ dataSchema }
            uiSchema={ uiSchema }
            fields={ CustomFields }
            // FieldTemplate={ FieldTemplate }
            ArrayFieldTemplate={ ArrayTemplate }
            // ObjectFieldTemplate={ ObjectTemplate }
            onChange={ this.log("changed") }
            onSubmit={ this.log("submitted") }
            onError={ this.log("errors") }
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
})

export default connect(mapStateToProps)(GenerateSchema)
