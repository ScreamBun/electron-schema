import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';
import { Droppable } from 'react-drag-and-drop';
import {
  TabContent,
  TabPane
} from 'reactstrap';


import SchemaStructure from './lib/structure';
import * as Tabs from './lib/tabs';
import * as ConvertActions from '../../store/actions/convert';
import { setTabs } from '../../store/actions/tabs';

class GenerateSchema extends Component {
  constructor(props, context) {
    super(props, context);
    this.mql = window.matchMedia('(min-width: 768px)');

    this.state = {
      schema: { meta: {}, types: [] },
      schemaPath: ''
    };

    this.props.setTabs(['Editor', ...Object.keys(Tabs)]);
    this.tabs = Object.entries(Tabs).map(([name, Tab]) => <Tab key={ name } />);

    this.keys = SchemaStructure;
    this.minHeight = '50em';

    ipcRenderer.on('file-open', (event, store) => {
      this.setState({
        schema: store.contents,
        schemaPath: store.filePaths[0]
      });
    });

    ipcRenderer.on('file-save', (event, store) => {
      const { schema, schemaPath } = this.state;
      ipcRenderer.send('file-save', {
        ...store,
        contents: schema,
        filePath: schemaPath
      });
    });

    ipcRenderer.on('save-reply', (event, store) => {
      this.setState(() => {
        const stateUpdate = {};
        if (store.action === 'erase') {
          stateUpdate.schema = { meta: {}, types: [] };
          stateUpdate.schemaPath = '';
        } else if ('filePath' in store) {
          stateUpdate.schemaPath = store.filePath;
        }
        return stateUpdate;
      });
    });

    ipcRenderer.on('schema-new', (event, store) => {
      const stateUpdate = {};
      switch (store.action) {
        case 'save':
          ipcRenderer.send(
            'file-save',
            {
              action: 'erase',
              contents: this.state.schema,
              filePath: this.state.schemaPath
            }
          );
          break;

        case 'erase':
        default:
          stateUpdate.schema = { meta: {}, types: [] };
          stateUpdate.schemaPath = '';
          break;
      }
      this.setState(stateUpdate);
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const propsChange = this.props !== nextProps;
    const stateChange = this.state !== nextState;

    if (this.state.schema !== nextState.schema) {
      this.props.setJADN(nextState.schema);
      this.props.jadn2json(nextState.schema);
      this.props.jadn2md(nextState.schema);
    }

    return propsChange || stateChange;
  }

  onDrop(data) {
    if (data.meta) {
      if (!(data.meta in (this.state.schema.meta || {}))) {
        this.setState(prevState => ({
          schema: {
            ...prevState.schema,
            meta: {
              ...prevState.schema.meta || {},
              ...this.keys.meta[data.meta].edit()
            }
          }
        }));
      }
    } else if (data.types) {
      this.setState(prevState => {
        const tmpTypes = prevState.schema.types || [];
        const tmpDef = this.keys.types[data.types].edit();
        if ((tmpTypes.filter(d => d[0] === tmpDef[0]) || []).length === 0) {
          tmpTypes.push(tmpDef);
        }
        return {
          schema: {
            ...prevState.schema,
            types: tmpTypes
          }
        };
      });
    } else {
      console.log('oops...');
    }
  }

  SchemaEditor() {
    const metaEditors = Object.keys(this.keys.meta).map((k, i) => {
      const { editor } = this.keys.meta[k];
      if (k in this.state.schema.meta) {
        return editor({
          key: i,
          value: this.state.schema.meta[k],
          placeholder: k,
          change: val => this.setState(prevState => ({
            schema: {
              ...prevState.schema,
              meta: {
                ...prevState.schema.meta,
                ...this.keys.meta[k].edit(val)
              }
            }
          })),
          remove: id => {
            if (id in this.state.schema.meta) {
              this.setState(prevState => {
                const tmpMeta = { ...prevState.schema.meta };
                delete tmpMeta[id];
                return {
                  schema: {
                    ...prevState.schema,
                    meta: tmpMeta
                  }
                };
              });
            }
          }
        });
      }
      // eslint-disable-next-line no-useless-return
      return;
    }).filter(Boolean);

    const typesEditors = (this.state.schema.types || []).map((def, i) => {
      const type = def[1].toLowerCase();
      return this.keys.types[type].editor({
        key: i,
        value: def,
        dataIndex: i,
        change: (val, idx) => this.setState(prevState => {
          const tmpTypes = [ ...prevState.schema.types ];
          tmpTypes[idx] = this.keys.types[val.type.toLowerCase()].edit(val);
          return {
            schema: {
              ...prevState.schema,
              types: tmpTypes
            }
          };
        }),
        remove: idx => {
          if (this.state.schema.types.length >= idx) {
            this.setState(prevState => {
              const tmpTypes = [ ...prevState.schema.types ];
              tmpTypes.splice(idx, 1);
              return {
                schema: {
                  ...prevState.schema,
                  types: tmpTypes
                }
              };
            });
          }
        }
      });
    });

    return (
      <div>
        <div className="col-12">
          <h2>Meta</h2>
          { metaEditors }
        </div>
        <hr />
        <div className="col-12">
          <h2>Types</h2>
          { typesEditors }
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="row mx-auto">
        <div id="schema-view" className="col-12">
          <Droppable
            types={ ['meta', 'types'] } // <= allowed drop types
            onDrop={ this.onDrop.bind(this) }
            className="col-12 p-0"
            style={{
              minHeight: this.minHeight
            }}
          >
            <TabContent activeTab={ this.props.activeView }>
              <TabPane tabId="editor" className="border">
                { this.SchemaEditor() }
              </TabPane>

              { this.tabs }
            </TabContent>
          </Droppable>
        </div>
      </div>
    );
  }
}

GenerateSchema.propTypes = {
  activeView: PropTypes.string.isRequired,
  setTabs: PropTypes.func.isRequired,
  setJADN: PropTypes.func.isRequired,
  jadn2json: PropTypes.func.isRequired,
  jadn2md: PropTypes.func.isRequired
};

GenerateSchema.defaultProps = {};

const mapStateToProps = state => ({
  activeView: state.tabs.activeView
});

const mapDispatchToProps = dispatch => ({
  setTabs: tabs => dispatch(setTabs(tabs)),
  setJADN: jadn => dispatch(ConvertActions.setJADN(jadn)),
  jadn2json: jadn => dispatch(ConvertActions.convertToJSON(jadn)),
  jadn2md: jadn => dispatch(ConvertActions.convertToMD(jadn))
});

export default connect(mapStateToProps, mapDispatchToProps)(GenerateSchema);
