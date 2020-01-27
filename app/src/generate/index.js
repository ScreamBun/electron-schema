import React, { Component } from 'react'
import { connect } from 'react-redux'
import Sidebar from 'react-sidebar'

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

import { convertToJSON } from '../../store/actions/jadn'


class GenerateSchema extends Component {
  constructor(props, context) {
    super(props, context)
    this.mql = window.matchMedia('(min-width: 768px)')

    this.onDrop = this.onDrop.bind(this)

    this.state = {
		  activeView: 'editor',
		  schema: {meta: {}, types: []},
		  schemaPath: ''
		}
    this.props.jadn2json(this.state.schema)

    this.linkStyles = {
      'cursor': 'pointer'
    }

    this.keys = SchemaStructure
    console.log(this.keys);
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
        if (store.action == 'erase') {
          return {
            schema: {},
            schemaPath: ''
          }
        } else if (store.hasOwnProperty('filePath')) {
          return {
            schemaPath: store.filePath
          }
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
  }

  shouldComponentUpdate(nextProps, nextState) {
    let propsChange = this.props != nextProps
    let stateChange = this.state != nextState

    if (this.state.schema != nextState.schema) {
      this.props.jadn2json(nextState.schema)
    }

    return propsChange || stateChange
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

  SchemaEditor() {
    let metaEditors = Object.keys(this.keys.meta).map((k, i) => {
      let editor = this.keys.meta[k].editor
      if (this.state.schema.meta.hasOwnProperty(k)) {
        return editor({
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
        })
      }
    }).filter(Boolean)

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
                className={ this.state.activeView === 'editor' ? 'active' : '' }
                style={ this.linkStyles }
                onClick={ () => this.toggleViews('editor') }
              >Editor</NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={ this.state.activeView === 'jadn' ? 'active' : '' }
                style={ this.linkStyles }
                onClick={ () => this.toggleViews('jadn') }
              >JADN</NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={ this.state.activeView === 'json' ? 'active' : '' }
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
