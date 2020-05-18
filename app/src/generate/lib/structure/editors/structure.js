import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  ButtonGroup,
  Collapse,
  FormGroup,
  Input,
  InputGroup,
  Label
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMinusCircle,
  faPlusCircle,
  faPlusSquare
} from '@fortawesome/free-solid-svg-icons';

import OptionsModal from './OptionsModal';
import FieldEditor, { StandardField, EnumeratedField } from './field';

// Structure Editor
class StructureEditor extends Component {
  constructor(props, context) {
    super(props, context);

    this.removeAll = this.removeAll.bind(this);
    this.onChange = this.onChange.bind(this);
    this.toggleFields = this.toggleFields.bind(this);
    this.addField = this.addField.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.saveModal = this.saveModal.bind(this);

    this.state = {
      fieldCollapse: false,
      value: {
        name: '',
        type: '',
        options: [],
        comment: '',
        fields: []
      },
      modal: false
    };

    this.fieldStyles = {
      maxHeight: '20em',
      overflowY: 'scroll'
    };
  }

  componentDidMount() {
    this.initState();
  }

  initState() {
    if (this.props.value && typeof(this.props.value) === 'object') {
      const updatevalue = {};
      if (this.props.value[0] !== this.state.value.name) updatevalue.name = this.props.value[0];
      if (this.props.value[1] !== this.state.value.type) updatevalue.type = this.props.value[1];
      if (this.props.value[2] !== this.state.value.options) updatevalue.options = this.props.value[2];
      if (this.props.value[3] !== this.state.value.comment) updatevalue.comment = this.props.value[3];
      if (this.props.value[4] !== this.state.value.fields) updatevalue.fields = this.props.value[4];

      if (Object.keys(updatevalue).length > 0) {
        this.setState(prevState => ({
          value: {
            ...prevState.value,
            ...updatevalue
          }
        }));
      }
    }
  }

  removeAll() {
    this.props.remove(this.props.dataIndex);
  }

  addField() {
    const field = Object.values(((this.state.value.type.toLowerCase() === 'enumerated') ? EnumeratedField : StandardField));
    field[0] = this.state.value.fields.length + 1;

    this.setState(prevState => {
      const tmpFields = [ ...prevState.value.fields, field ];
      return {
        fieldCollapse: true,
        value: {
          ...prevState.value,
          fields: tmpFields
        }
      };
    }, () => {
      this.props.change(this.state.value, this.props.dataIndex);
    });
  }

  onChange(e) {
    const key = e.target.placeholder.toLowerCase();
    const value = e.target.value;

    this.setState(prevState => ({
      value: {
        ...prevState.value,
        [key]: value
      }
    }), () => {
      if (this.props.change) {
        this.props.change(this.state.value, this.props.dataIndex);
      }
    });
  }

  toggleFields() {
    this.setState(prevState => ({
      fieldCollapse: !prevState.fieldCollapse
    }));
  }

  toggleModal() {
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  }

  saveModal(data) {
    this.toggleModal();

    this.setState(prevState => ({
      value: {
        ...prevState.value,
        options: data
      }
    }), () => {
      if (this.props.change) {
        this.props.change(this.state.value, this.props.dataIndex);
      }
    });
  }

  render() {
    setTimeout(() => this.initState(), 100);
    const structureFields = (this.state.value.fields || []).map((f, i) => (
      <FieldEditor
        key={ i }
        dataIndex={ i }
        enumerated={ this.state.value.type.toLowerCase() === 'enumerated' }
        value={ f }
        change={ (val, idx) => this.setState(prevState => {
          const tmpFields = [ ...prevState.value.fields ];
          tmpFields[idx] = val;
          return {
            value: {
              ...prevState.value,
              fields: tmpFields
            }
          };
        }, () => {
          if (this.props.change) {
            this.props.change(this.state.value, this.props.dataIndex);
          }
        })}
        remove={ idx => {
          if (this.state.value.fields.length >= idx) {
            this.setState((prevState) => {
              const tmpFields = [ ...prevState.value.fields ];
              tmpFields.splice(idx, 1);
              return {
                value: {
                  ...prevState.value,
                  fields: tmpFields
                }
              };
            }, () => {
              if (this.props.change) {
                this.props.change(this.state.value, this.props.dataIndex);
              }
            });
          }
        }}
      />
    ));

    return (
      <div className="border m-1 p-1">
        <ButtonGroup size="sm" className="float-right">
          <Button color="danger" onClick={ this.removeAll } >
            <FontAwesomeIcon icon={ faMinusCircle } />
          </Button>
        </ButtonGroup>

        <div className="border-bottom mb-2">
          <h3 className="col-sm-10 my-1">{ `${this.state.value.name}(${this.state.value.type})` }</h3>
        </div>

        <div className="row m-0">
          <FormGroup className="col-md-4">
            <Label>Name</Label>
            <Input type="string" placeholder="Name" value={ this.state.value.name } onChange={ this.onChange } />
          </FormGroup>

          <FormGroup className="col-md-4">
            <Label>&nbsp;</Label>
            <InputGroup>
              <Button outline color="info" onClick={ this.toggleModal }>Type Options</Button>
              <OptionsModal
                optionvalue={ this.state.value.options }
                isOpen={ this.state.modal }
                toggleModal={ this.toggleModal }
                saveModal={ this.saveModal }
              />
            </InputGroup>
          </FormGroup>

          <FormGroup className="col-md-4">
            <Label>Comment</Label>
            <Input type="textarea" placeholder="Comment" rows={ 1 } value={ this.state.value.comment } onChange={ this.onChange } />
          </FormGroup>

          <FormGroup tag="fieldset" className="col-12 border">
            <legend>
              Fields
              <ButtonGroup className="float-right">
                <Button color={ this.state.fieldCollapse ? 'warning' : 'success' } onClick={ this.toggleFields } >
                  <FontAwesomeIcon icon={ this.state.fieldCollapse ? faMinusCircle : faPlusCircle } />&nbsp;
                  { this.state.fieldCollapse ? ' Hide' : ' Show' }
                </Button>
                <Button color="primary" onClick={ this.addField } >
                  <FontAwesomeIcon icon={ faPlusSquare } /> Add
                </Button>
              </ButtonGroup>
            </legend>

            <Collapse isOpen={ this.state.fieldCollapse }>
              { structureFields }
            </Collapse>
            { !this.state.fieldCollapse && structureFields.length > 0 ? (
              <p>Expand to view/edit fields</p>
            ) : '' }
          </FormGroup>
        </div>
      </div>
    );
  }
}

StructureEditor.propTypes = {
  dataIndex: PropTypes.number,
  value: PropTypes.array,
  change: PropTypes.func,
  remove: PropTypes.func
};

StructureEditor.defaultProps = {
  dataIndex: -1,
  value: [],
  change: null,
  remove: null
};

export default StructureEditor;
