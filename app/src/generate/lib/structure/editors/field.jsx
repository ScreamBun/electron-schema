import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isDeepStrictEqual } from 'util';
import {
  Button, ButtonGroup, FormGroup, Input, Label
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import OptionsModal from './options';
import {
  objectValues, splitCamel, zip
} from '../../../../utils';

export const StandardField = {
  id: 1,
  name: 'name',
  type: '',
  options: [],
  comment: ''
};

export const EnumeratedField = {
  id: 1,
  value: 'value',
  comment: ''
};

// Field Editor
class FieldEditor extends Component {
  constructor(props, context) {
    super(props, context);
    this.onChange = this.onChange.bind(this);
    this.onSelectChange = this.onSelectChange.bind(this);
    this.removeAll = this.removeAll.bind(this);
    this.saveModal = this.saveModal.bind(this);
    this.toggleModal = this.toggleModal.bind(this);

    const { enumerated, value } = this.props;
    this.fieldKeys = Object.keys(enumerated ? EnumeratedField : StandardField);

    this.state = {
      value: zip(this.fieldKeys, value),
      modal: false
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
      change(objectValues(this.state.value), dataIndex);
    });
  }

  onSelectChange(e) {
    const { value } = e.target;
    const key = e.nativeEvent.target.name.toLowerCase();

    this.setState(prevState => ({
      value: {
        ...prevState.value,
        [key]: value
      }
    }), () => {
      const { change, dataIndex } = this.props;
      // eslint-disable-next-line react/destructuring-assignment
      change(objectValues(this.state.value), dataIndex);
    });
  }

  initState() {
    const { value } = this.props;
    if (value && Array.isArray(value)) {
      const updatevalue = zip(this.fieldKeys, value);

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
      change(objectValues(this.state.value), dataIndex);
    });
  }

  makeOptions() {
    const { allTypes, enumerated, schemaTypes } = this.props;
    const { modal, value } = this.state;

    if (enumerated) {
      return (
        <FormGroup className="col-md-4">
          <Label>Value</Label>
          <Input type="string" placeholder="Value" value={ value.value } onChange={ this.onChange } />
        </FormGroup>
      );
    }

    const options = Object.keys(schemaTypes).map(optGroup => (
      <optgroup key={ optGroup } label={ splitCamel(optGroup) } >
        { schemaTypes[optGroup].map(opt => <option key={ opt } value={ opt } >{ opt }</option> ) }
      </optgroup>
    ));
    const val = allTypes.includes(value.type) ? value.type : 'Null';

    return (
      <div className="col-md-9 p-0 m-0">
        <FormGroup className="col-md-4 d-inline-block">
          <Label>Name</Label>
          <Input type="string" placeholder="Name" value={ value.name } onChange={ this.onChange } />
        </FormGroup>

        <FormGroup className="col-md-4 d-inline-block">
          <Label>Type</Label>
          <Input type="select" name="Type" value={ val } onChange={ this.onSelectChange } >
            { options }
          </Input>
        </FormGroup>

        <FormGroup className="col-md-4 d-inline-block">
          <Button outline color="info" onClick={ this.toggleModal }>Field Options</Button>
          <OptionsModal
            optionValues={ value.options }
            isOpen={ modal }
            saveModal={ this.saveModal }
            toggleModal={ this.toggleModal }
            optionType={ value.type }
            fieldOptions
          />
        </FormGroup>
      </div>
    );
  }

  render() {
    const { enumerated } = this.props;
    const { value } = this.state;

    return (
      <div className="col-sm-12 border m-1 p-1">
        <ButtonGroup size="sm" className="float-right">
          <Button color="danger" onClick={ this.removeAll } >
            <FontAwesomeIcon icon={ faMinusCircle } />
          </Button>
        </ButtonGroup>

        <div className="border-bottom mb-2">
          <p className="col-sm-4 my-1"><strong>{ enumerated ? value.value : value.name }</strong></p>
        </div>

        <div className="row m-0">
          <FormGroup className={ enumerated ? 'col-md-4' : 'col-md-3' }>
            <Label>ID</Label>
            <Input type="number" placeholder="ID" value={ value.id } onChange={ this.onChange } />
          </FormGroup>

          { this.makeOptions() }

          <FormGroup className={ enumerated ? 'col-md-4' : 'col-md-12' }>
            <Label>Comment</Label>
            <Input
              type="textarea"
              placeholder="Comment"
              rows={ 1 }
              value={ value.comment }
              onChange={ this.onChange }
            />
          </FormGroup>
        </div>
      </div>
    );
  }
}

FieldEditor.propTypes = {
  allTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  schemaTypes: PropTypes.shape({
    baseTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
    schemaTypes: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired,
  enumerated: PropTypes.bool,
  dataIndex: PropTypes.number,
  value: PropTypes.array,
  change: PropTypes.func,
  remove: PropTypes.func
};

FieldEditor.defaultProps = {
  enumerated: false,
  dataIndex: -1,
  value: [],
  change: (val, idx) => null,  // eslint-disable-line no-unused-vars
  remove: (idx) => null  // eslint-disable-line no-unused-vars
};

const mapStateToProps = state => ({
  allTypes: [...state.jadn.baseTypes, ...Object.keys(state.jadn.schemaTypes)],
  schemaTypes: {
    baseTypes: state.jadn.baseTypes,
    schemaTypes: Object.keys(state.jadn.schemaTypes)
  }
});

export default connect(mapStateToProps)(FieldEditor);
