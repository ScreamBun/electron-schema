import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  ButtonGroup,
  FormGroup,
  Input,
  Label
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';

import OptionsModal from './OptionsModal';

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
const FieldEditor = props => {
  const [isOpen, toggleModal] = useState(false);
  // const [isFieldEditor] = useState(true);
  const values = {};

  if (props.value && typeof props.value === 'object') {
    values.id = props.value[0] || '';

    if (props.enumerated) {
      values.value = props.value[1] || '';
      values.comment = props.value[2] || '';
    } else {
      values.name = props.value[1] || '';
      values.type = props.value[2] || '';
      values.options = props.value[3] || [];
      values.comment = props.value[4] || '';
    }
  }

  const removeAll = () => props.remove(props.dataIndex);

  const onChange = (e, isNum) => {
    const key = e.target.placeholder.toLowerCase();
    let value = e.target.value;

    if (isNum && ( !/^\d+$/.test(value) && value !== '' )) return;

    if (key === 'options') {
      value = value.split(/,\s+?/);
    }

    values[key] = value;

    if (props.change) {
      const tmpVals = Object.values(values);
      tmpVals[0] = Number(tmpVals[0]);
      props.change(tmpVals, props.dataIndex);
    }
  };

  const saveModal = data => {
    toggleModal(!isOpen);
    // data = data.split(/,\s+?/);
    values.options = data;

    if (props.change) {
      const tmpVals = Object.values(values);
      tmpVals[0] = Number(tmpVals[0]);
      props.change(tmpVals, props.dataIndex);
    }
  };

  let options = (
    <div className="col-md-9 p-0 m-0">
      <FormGroup className="col-md-4 d-inline-block">
        <Label>Name</Label>
        <Input type="string" placeholder="Name" value={ values.name } onChange={ onChange } />
      </FormGroup>

      <FormGroup className="col-md-4 d-inline-block">
        <Label>Type</Label>
        <Input type="string" placeholder="Type" value={ values.type } onChange={ onChange } />
      </FormGroup>

      <FormGroup className="col-md-4 d-inline-block">
        <Button outline color="info" onClick={ () => toggleModal(!isOpen) }>Field Options</Button>
        <OptionsModal
          saveModal={ saveModal }
          isOpen={ isOpen }
          toggleModal={ () => toggleModal(!isOpen) }
          fieldOptions
        />
      </FormGroup>
    </div>
  );
  if (props.enumerated) {
    options = (
      <FormGroup className="col-md-4">
        <Label>Value</Label>
        <Input type="string" placeholder="Value" value={ values.value } onChange={ onChange } />
      </FormGroup>
    );
  }

  return (
    <div className="col-sm-12 border m-1 p-1">
      <ButtonGroup size="sm" className="float-right">
        <Button color="danger" onClick={ removeAll } >
          <FontAwesomeIcon icon={ faMinusCircle } />
        </Button>
      </ButtonGroup>

      <div className="border-bottom mb-2">
        <p className="col-sm-4 my-1"><strong>{ props.enumerated ? values.value : values.name }</strong></p>
      </div>

      <div className="row m-0">
        <FormGroup className={ props.enumerated ? 'col-md-4' : 'col-md-3' }>
          <Label>ID</Label>
          <Input type="number" placeholder="ID" value={ values.id } onChange={ (e) => onChange(e, true) } />
        </FormGroup>

        { options }

        <FormGroup className={ props.enumerated ? 'col-md-4' : 'col-md-12' }>
          <Label>Comment</Label>
          <Input
            type="textarea"
            placeholder="Comment"
            rows={ 1 }
            value={ values.comment }
            onChange={ onChange }
          />
        </FormGroup>
      </div>
    </div>
  );
};

FieldEditor.propTypes = {
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
  change: null,
  remove: null
};

export default FieldEditor;