import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isDeepStrictEqual } from 'util';
import {
  Button, ButtonGroup, Collapse, FormGroup, Input, InputGroup, Label
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMinusCircle, faPlusCircle, faPlusSquare
} from '@fortawesome/free-solid-svg-icons';

import { FieldKeys } from './consts';
import OptionsModal from './options';
import FieldEditor, { StandardField, EnumeratedField } from './field';
import { zip } from '../../../../utils';

// Structure Editor
class StructureEditor extends Component {
  constructor(props, context) {
    super(props, context);
    this.addField = this.addField.bind(this);
    this.onChange = this.onChange.bind(this);
    this.removeAll = this.removeAll.bind(this);
    this.saveModal = this.saveModal.bind(this);
    this.toggleFields = this.toggleFields.bind(this);
    this.toggleModal = this.toggleModal.bind(this);

    const { value } = this.props;
    this.state = {
      fieldCollapse: false,
      value: zip(FieldKeys, value),
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

  onChange(e) {
    const { placeholder, value } = e.target;
    const key = placeholder.toLowerCase();

    this.setState(prevState => ({
      value: {
        ...prevState.value,
        [key]: value
      }
    }), () => {
      const { change, dataIndex } = this.props;
      // eslint-disable-next-line react/destructuring-assignment
      change(this.state.value, dataIndex);
    });
  }

  initState() {
    const { value } = this.props;
    if (value && Array.isArray(value)) {
      const updatevalue = zip(FieldKeys, value);

      // eslint-disable-next-line react/destructuring-assignment
      if (!isDeepStrictEqual(updatevalue, this.state.value)) {
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
    const { dataIndex, remove } = this.props;
    remove(dataIndex);
  }

  addField() {
    const { value } = this.state;
    const field = Object.values(((value.type.toLowerCase() === 'enumerated') ? EnumeratedField : StandardField));
    field[0] = value.fields.length + 1;

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
      const { change, dataIndex } = this.props;
      // eslint-disable-next-line react/destructuring-assignment
      change(this.state.value, dataIndex);
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
      const { change, dataIndex } = this.props;
      // eslint-disable-next-line react/destructuring-assignment
      change(this.state.value, dataIndex);
    });
  }

  makeFields() {
    const fieldChange = (val, idx) => this.setState(prevState => {
      const tmpFields = [ ...prevState.value.fields ];
      tmpFields[idx] = val;
      return {
        value: {
          ...prevState.value,
          fields: tmpFields
        }
      };
    }, () => {
      const { change, dataIndex } = this.props;
      change(this.state.value, dataIndex);  // eslint-disable-line react/destructuring-assignment
    });

    const fieldRemove = idx => {
      if (this.state.value.fields.length >= idx) {  // eslint-disable-line react/destructuring-assignment
        this.setState(prevState => {
          const tmpFields = [ ...prevState.value.fields ];
          tmpFields.splice(idx, 1);
          return {
            value: {
              ...prevState.value,
              fields: tmpFields
            }
          };
        }, () => {
          const { change, dataIndex } = this.props;
          change(this.state.value, dataIndex);  // eslint-disable-line react/destructuring-assignment
        });
      }
    };

    // eslint-disable-next-line react/destructuring-assignment
    const { fields, name, type } = this.state.value;
    return (fields || []).map((f, i) => (
      <FieldEditor
        key={ `${name}.${f[1]}` }
        dataIndex={ i }
        enumerated={ type.toLowerCase() === 'enumerated' }
        value={ f }
        change={ fieldChange }
        remove={ fieldRemove }
      />
    ));
  }

  render() {
    const { fieldCollapse, modal, value } = this.state;
    const structureFields = this.makeFields();

    return (
      <div className="border m-1 p-1">
        <ButtonGroup size="sm" className="float-right">
          <Button color="danger" onClick={ this.removeAll } >
            <FontAwesomeIcon icon={ faMinusCircle } />
          </Button>
        </ButtonGroup>

        <div className="border-bottom mb-2">
          <h3 className="col-sm-10 my-1">{ `${value.name}(${value.type})` }</h3>
        </div>

        <div className="row m-0">
          <FormGroup className="col-md-4">
            <Label>Name</Label>
            <Input type="string" placeholder="Name" value={ value.name } onChange={ this.onChange } />
          </FormGroup>

          <FormGroup className="col-md-2">
            <Label>&nbsp;</Label>
            <InputGroup>
              <Button outline color="info" onClick={ this.toggleModal }>Type Options</Button>
              <OptionsModal
                optionValues={ value.options }
                isOpen={ modal }
                optionType={ value.type }
                toggleModal={ this.toggleModal }
                saveModal={ this.saveModal }
              />
            </InputGroup>
          </FormGroup>

          <FormGroup className="col-md-6">
            <Label>Comment</Label>
            <Input type="textarea" placeholder="Comment" rows={ 1 } value={ value.comment } onChange={ this.onChange } />
          </FormGroup>

          <FormGroup tag="fieldset" className="col-12 border">
            <legend>
              Fields
              <ButtonGroup className="float-right">
                <Button color={ fieldCollapse ? 'warning' : 'success' } onClick={ this.toggleFields } >
                  <FontAwesomeIcon icon={ fieldCollapse ? faMinusCircle : faPlusCircle } />
                  &nbsp;
                  { fieldCollapse ? ' Hide' : ' Show' }
                </Button>
                <Button color="primary" onClick={ this.addField } >
                  <FontAwesomeIcon icon={ faPlusSquare } />
                  &nbsp;
                  Add
                </Button>
              </ButtonGroup>
            </legend>

            <Collapse isOpen={ fieldCollapse }>
              { structureFields }
            </Collapse>
            { !fieldCollapse && structureFields.length > 0 ? <p>Expand to view/edit fields</p> : '' }
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
  change: (val, idx) => null,  // eslint-disable-line no-unused-vars
  remove: (idx) => null  // eslint-disable-line no-unused-vars
};

export default StructureEditor;
