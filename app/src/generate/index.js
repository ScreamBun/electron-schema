import React, { Component } from 'react'
import { connect } from 'react-redux'

import classnames from 'classnames'
import {
  Draggable,
  Droppable
} from 'react-drag-and-drop'

import {
  Button,
  ButtonGroup,
  ListGroup,
  ListGroupItem,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Tooltip
} from 'reactstrap'

import SchemaStructure from './lib/structure'

// import oc2ls from '../../resources/oc2ls-v1_0_1.keys.json'
// import oc2ls from '../../resources/oc2ls-v1_0_1.simple.jadn'

class GenerateSchema extends Component {
  constructor(props, context) {
    super(props, context)
    this.onDrop = this.onDrop.bind(this)

    this.state = {
		    schema: {},
		    activeOption: 'meta',
		    activeView: 'editor',
		}
    this.linkStyles = {
      'cursor': 'pointer'
    }
    this.keys = SchemaStructure
  }

  toggleOptions(opt) {
    if (this.state.activeOption !== opt) {
      this.setState({
        activeOption: opt
      })
    }
  }

  toggleViews(view) {
    if (this.state.activeView !== view) {
      this.setState({
        activeView: view
      })
    }
  }

  onDrop(data) {
    if (data.meta) {
      if (!(data.meta in (this.state.schema.meta || {}))) {
        this.setState((prevState) => ({
          schema: {
            ...prevState.schema,
            meta: {
              ...prevState.schema.meta || {},
              ...this.keys.meta[data.meta].edit()
            }
          }
        }))
      }
    } else if (data.types) {
      this.setState((prevState) => {
        let tmpTypes = prevState.schema.types || []
        let tmpDef = this.keys.types[data.types].edit()
        if ((tmpTypes.filter(d => d[0] === tmpDef[0]) || []).length === 0) {
          tmpTypes.push(tmpDef)
        }
        return {
          schema: {
            ...prevState.schema,
            types: tmpTypes
          }
        }
      })
    } else {
      console.log('oops...')
    }
  }

  SchemaOptions() {
    let metaKeys = Object.keys(this.keys.meta).map((k, i) => (
      <Draggable type="meta" data={ k } key={ i }>
        <ListGroupItem action>{ this.keys.meta[k].key }</ListGroupItem>
      </Draggable>
    ))

    let typesKeys = Object.keys(this.keys.types).map((k, i) => (
      <Draggable type="types" data={ k } key={ i }>
        <ListGroupItem action>{ this.keys.types[k].key }</ListGroupItem>
      </Draggable>
    ))

    return (
      <div id='schema-options' className='col-md-2'>
        <Nav tabs>
          <NavItem>
            <NavLink
              className={ classnames({ active: this.state.activeOption === 'meta' }) }
              style={ this.linkStyles }
              onClick={ () => this.toggleOptions('meta') }
            >Meta</NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={ classnames({ active: this.state.activeOption === 'types' }) }
              style={ this.linkStyles }
              onClick={ () => this.toggleOptions('types') }
            >Types</NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={ this.state.activeOption }>
          <TabPane tabId='meta'>
            <ListGroup>
              { metaKeys }
            </ListGroup>
          </TabPane>
          <TabPane tabId='types'>
            <ListGroup>
              { typesKeys }
            </ListGroup>
          </TabPane>
        </TabContent>
      </div>
    )
  }

  SchemaEditor() {
    let metaEditors = Object.keys(this.state.schema.meta || {}).map((k, i) => this.keys.meta[k].editor({
      key: i,
      value: this.state.schema.meta[k],
      placeholder: k,
      change: (val) => this.setState((prevState) => ({
        schema: {
          ...prevState.schema,
          meta: {
            ...prevState.schema.meta,
            ...this.keys.meta[k].edit(val)
          }
        }
      })),
      remove: (id) => {
        if (id in this.state.schema.meta) {
          this.setState((prevState) => {
            let tmpMeta = { ...prevState.schema.meta }
            delete tmpMeta[id]
            return {
              schema: {
                ...prevState.schema,
                meta: tmpMeta
              }
            }
          })
        }
      }
    }))

    let typesEditors = (this.state.schema.types || []).map((def, i) => {
      let type = def[1].toLowerCase()
      return this.keys.types[type].editor({
        key: i,
        value: def,
        dataIndex: i,
        change: (val, idx) => this.setState((prevState) => {
          let tmpTypes = [ ...prevState.schema.types ]
          tmpTypes[idx] = this.keys.types[val.type.toLowerCase()].edit(val)
          return {
            schema: {
              ...prevState.schema,
              types: tmpTypes
            }
          }
        }),
        remove: (idx) => {
          if (this.state.schema.types.length >= idx) {
            this.setState((prevState) => {
              let tmpTypes = [ ...prevState.schema.types ]
              tmpTypes.splice(idx, 1)
              return {
                schema: {
                  ...prevState.schema,
                  types: tmpTypes
                }
              }
            })
          }
        }
      })
    })

    return (
      <div>
        <div className='col-12'>
          <h2>Meta</h2>
          { metaEditors }
        </div>
        <hr />
        <div className='col-12'>
          <h2>Types</h2>
          { typesEditors }
        </div>
      </div>
    )
  }

  SchemaView() {
    return (
      <div id='schema-view' className='col-md-10'>
        <Nav tabs>
          <NavItem>
            <NavLink
              className={ classnames({ active: this.state.activeView === 'editor' }) }
              style={ this.linkStyles }
              onClick={ () => this.toggleViews('editor') }
            >Editor</NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={ classnames({ active: this.state.activeView === 'jadn' }) }
              style={ this.linkStyles }
              onClick={ () => this.toggleViews('jadn') }
            >JADN</NavLink>
          </NavItem>
        </Nav>

        <Droppable
          types={ ['meta', 'types'] } // <= allowed drop types
          onDrop={ this.onDrop }
          className='border col-12 p-0'
          style={{
            minHeight: 20+'em'
          }}
        >
          <TabContent activeTab={ this.state.activeView }>
            <TabPane tabId='editor'>
              { this.SchemaEditor() }
            </TabPane>
            <TabPane tabId='jadn'>
              <div className="form-control m-0 p-0" style={{ minHeight: 20+'em' }}>
                <pre>{ JSON.stringify(this.state.schema) }</pre>
              </div>
            </TabPane>
          </TabContent>
        </Droppable>
      </div>
    )
  }

  render() {
    return (
      <div className="row mx-auto">
        { this.SchemaOptions() }
        { this.SchemaView() }
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
})

export default connect(mapStateToProps)(GenerateSchema)
