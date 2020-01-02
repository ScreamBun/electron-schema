import React, { Component } from 'react'
import { connect } from 'react-redux'
import Sidebar from 'react-sidebar'

import classnames from 'classnames'
import {
  Draggable,
  Droppable
} from 'react-drag-and-drop'

import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  ListGroup,
  ListGroupItem,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Tooltip
} from 'reactstrap'

import { dialog, ipcRenderer } from 'electron'

import SchemaStructure from './lib/structure'
import { jadn_format } from '../utils/'

import JADNInput from '../utils/jadn-editor'
import JSONInput from 'react-json-editor-ajrm'
import locale from 'react-json-editor-ajrm/locale/en'

import { convertToJSON } from '../actions/jadn'
import oc2ls from '../../resources/oc2ls-v1_0_1.simple.jadn'

const pythonTest = async (schema) => {
  return await ipcRenderer.invoke('render-python', {schema})
}

class GenerateSchema extends Component {
  constructor(props, context) {
    super(props, context)
    this.mql = window.matchMedia('(min-width: 768px)')

    this.onDrop = this.onDrop.bind(this)

    this.state = {
		  activeView: 'editor',
		  schema: oc2ls,
		  schemaPath: ''
		}

    this.linkStyles = {
      'cursor': 'pointer'
    }

    this.keys = SchemaStructure
    this.minHeight = '50em'

    ipcRenderer.on('file-open', (event, store) => {
      this.setState({
        schema: store.contents,
        schemaPath: store.filePaths[0]    
      })
    })

    ipcRenderer.on('file-save', (event, store) => {
      store.contents = this.state.schema
      store.filePath = this.state.schemaPath
      ipcRenderer.send('file-save', store)
    })

    ipcRenderer.on('save-reply', (event, store) => {
      this.setState(prevState => {
        return store.action == 'erase' ?
          {
            schema: {},
            schemaPath: ''
          } : {
            schemaPath: store.filePath
          }
      })
    })

    ipcRenderer.on('schema-new', async (event, store) => {
      let stateUpdate = {}
      switch(store.action) {
        case 'save':
          store = {
            action: 'erase',
            contents: this.state.schema,
            filePath: this.state.schemaPath
          }
          ipcRenderer.send('file-save', store)
          break;

        case 'erase':
        default:
          stateUpdate.schema = {}
          stateUpdate.schemaPath = ''
          break;
      }
      this.setState(stateUpdate)
    })

    setTimeout(() => {
      pythonTest(this.state.schema).then(rslt => {
        console.log(rslt)
      })
    }, 2000)
  }

  toggleViews(view) {
    if (this.state.activeView !== view) {
      this.setState({
        activeView: view
      })

      this.props.jadn2json(this.state.schema);
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

  render() {
    return (
      <div className='row mx-auto'>
        <div id='schema-view' className='col-12'>
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
            <NavItem>
              <NavLink
                className={ classnames({ active: this.state.activeView === 'json' }) }
                style={ this.linkStyles }
                onClick={ () => this.toggleViews('json') }
              >JSON</NavLink>
            </NavItem>
          </Nav>

          <Droppable
            types={ ['meta', 'types'] } // <= allowed drop types
            onDrop={ this.onDrop }
            className='col-12 p-0'
            style={{
              minHeight: this.minHeight
            }}
          >
            <TabContent activeTab={ this.state.activeView }>
              <TabPane tabId='editor' className='border'>
                { this.SchemaEditor() }
              </TabPane>
              <TabPane tabId='jadn'>
                <div className="form-control m-0 p-0 border" style={{ minHeight: this.minHeight }}>
                  <JADNInput
                    id='jadn_schema'
                    placeholder={ this.state.schema }
                    theme='light_mitsuketa_tribute'
                    locale={ locale }
                    //reset={ true }
                    height='100%'
                    width='100%'
                    viewOnly={ true }
                    //waitAfterKeyPress={ 500 }
                  />
                </div>
              </TabPane>
              <TabPane tabId='json'>
                <div className="form-control m-0 p-0 border" style={{ minHeight: this.minHeight }}>
                  <JSONInput
                    id='json_schema'
                    placeholder={ this.props.json_schema }
                    theme='light_mitsuketa_tribute'
                    locale={ locale }
                    //reset={ true }
                    height='100%'
                    width='100%'
                    viewOnly={ true }
                    //waitAfterKeyPress={ 500 }
                  />
                </div>
              </TabPane>
            </TabContent>
          </Droppable>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  json_schema: state.jadn2json.json_schema
})

const mapDispatchToProps = (dispatch) => ({
  jadn2json: (jadn) => dispatch(convertToJSON(jadn))
})

export default connect(mapStateToProps, mapDispatchToProps)(GenerateSchema)
