import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';
import { Droppable } from 'react-drag-and-drop';
import { TabContent, TabPane } from 'reactstrap';

import * as SchemaStructure from './lib/structure';
import * as Tabs from './lib/tabs';
import * as JADNActions from '../../store/actions/jadn';
import * as TabActions from '../../store/actions/tabs';

const EmptySchema = {
  info: {},
  types: []
};

class GenerateSchema extends Component {
  constructor(props, context) {
    super(props, context);
    this.onDrop = this.onDrop.bind(this);
    this.mql = window.matchMedia('(min-width: 768px)');

    this.state = {
      schema: { ...EmptySchema },
      schemaPath: ''
    };

    const { setTabs } = this.props;
    setTabs(['Editor', ...Object.keys(Tabs)]);
    this.tabs = Object.entries(Tabs).map(([name, Tab]) => <Tab key={ name } />);
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
          stateUpdate.schema = { info: {}, types: [] };
          stateUpdate.schemaPath = '';
        } else if ('filePath' in store) {
          stateUpdate.schemaPath = store.filePath;
        }
        return stateUpdate;
      });
    });

    ipcRenderer.on('schema-new', (event, store) => {
      const { schema, schemaPath } = this.state;
      switch (store.action) {
        case 'save':
          ipcRenderer.send(
            'file-save',
            {
              action: 'erase',
              contents: schema,
              filePath: schemaPath
            }
          );
          break;

        case 'erase':
        default:
          this.setState({
            schema: { ...EmptySchema },
            schemaPath: ''
          });
      }
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const propsChange = this.props !== nextProps;
    const stateChange = this.state !== nextState;
    const { setJADN } = this.props;
    const { schema } = nextState;

    // eslint-disable-next-line react/destructuring-assignment
    if (this.state.schema !== schema) {
      setJADN(schema);
    }

    return propsChange || stateChange;
  }

  onDrop(data) {
    const { schema } = this.state;
    if (data.info) {
      if (!(data.info in (schema.info || {}))) {
        this.setState(prevState => ({
          schema: {
            ...prevState.schema,
            info: {
              ...prevState.schema.info || {},
              ...SchemaStructure.Info[data.info].edit()
            }
          }
        }));
      }
    } else if (data.types) {
      this.setState(prevState => {
        const tmpTypes = prevState.schema.types || [];
        const tmpDef = SchemaStructure.Types[data.types].edit();
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
    const { schema } = this.state;
    const infoEditors = Object.keys(SchemaStructure.Info).map((k, i) => {
      const { editor } = SchemaStructure.Info[k];
      if (k in schema.info) {
        return editor({
          key: i,
          value: schema.info[k],
          placeholder: k,
          change: val => this.setState(prevState => ({
            schema: {
              ...prevState.schema,
              info: {
                ...prevState.schema.info,
                ...SchemaStructure.Info[k].edit(val)
              }
            }
          })),
          remove: id => {
            if (id in schema.info) {
              this.setState(prevState => {
                const tmpInfo = { ...prevState.schema.info };
                delete tmpInfo[id];
                return {
                  schema: {
                    ...prevState.schema,
                    info: tmpInfo
                  }
                };
              });
            }
          }
        });
      }
      // eslint-disable-next-line no-useless-return
      return null;
    }).filter(Boolean);

    const typesEditors = (schema.types || []).map((def, i) => {
      const type = def[1].toLowerCase();
      return SchemaStructure.Types[type].editor({
        key: i,
        value: def,
        dataIndex: i,
        change: (val, idx) => this.setState(prevState => {
          const tmpTypes = [ ...prevState.schema.types ];
          tmpTypes[idx] = SchemaStructure.Types[val.type.toLowerCase()].edit(val);
          return {
            schema: {
              ...prevState.schema,
              types: tmpTypes
            }
          };
        }),
        remove: idx => {
          if (schema.types.length >= idx) {
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
          <h2>Info</h2>
          { infoEditors }
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
    const { activeView } = this.props;
    return (
      <div className="row mx-auto">
        <div id="schema-view" className="col-12">
          <Droppable
            types={ ['info', 'types'] } // <= allowed drop types
            onDrop={ this.onDrop }
            className="col-12 p-0"
            style={{
              minHeight: this.minHeight
            }}
          >
            <TabContent activeTab={ activeView } >
              <TabPane tabId="editor" className="border scroll-tab">
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
  setJADN: PropTypes.func.isRequired
};

GenerateSchema.defaultProps = {};

const mapStateToProps = state => ({
  activeView: state.tabs.activeView
});

const mapDispatchToProps = dispatch => ({
  setTabs: tabs => dispatch(TabActions.setTabs(tabs)),
  setJADN: jadn => dispatch(JADNActions.setJADN(jadn))
});

export default connect(mapStateToProps, mapDispatchToProps)(GenerateSchema);
