import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  ButtonGroup,
  FormGroup,
  Input,
  InputGroup,
  Label
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';

import OptionsModal from './OptionsModal';

// Primitive Editor
class PrimitiveEditor extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      value: {
        name: '',
        type: '',
        options: [],
        comment: ''
      },
      modal: false
    };
  }

  componentDidMount() {
    this.initState();
  }

  initState() {
    if (this.props.value && typeof this.props.value === 'object') {
      const updatevalue = {};
      if (this.props.value[0] !== this.state.value.name) updatevalue.name = this.props.value[0];
      if (this.props.value[1] !== this.state.value.type) updatevalue.type = this.props.value[1];
      if (this.props.value[2] !== this.state.value.options) updatevalue.options = this.props.value[2];
      if (this.props.value[3] !== this.state.value.comment) updatevalue.comment = this.props.value[3];

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

  removeAll() {
    this.props.remove(this.props.dataIndex);
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
    return (
      <div className="border m-1 p-1">
        <ButtonGroup size="sm" className="float-right">
          <Button color="danger" onClick={ this.removeAll.bind(this) } >
            <FontAwesomeIcon icon={ faMinusCircle } />
          </Button>
        </ButtonGroup>

        <div className="border-bottom mb-2">
          <h3 className="col-sm-10 my-1">{ `${this.state.value.name}(${this.state.value.type})` }</h3>
        </div>

        <div className="row m-0">
          <FormGroup className="col-md-4">
            <Label>Name</Label>
            <Input type="string" placeholder="Name" value={ this.state.value.name } onChange={ this.onChange.bind(this) } />
          </FormGroup>

          <FormGroup className="col-md-4">
              <Label>&nbsp;</Label>
              <InputGroup>
                <Button outline color="info" onClick={ this.toggleModal.bind(this) }>Type Options</Button>
                <OptionsModal
                  optionvalue={ this.state.value.options }
                  isOpen={ this.state.modal }
                  toggleModal={ this.toggleModal.bind(this) }
                  saveModal={ this.saveModal.bind(this) }
                />
              </InputGroup>
            </FormGroup>

          <FormGroup className="col-md-4">
            <Label>Comment</Label>
            <Input
              type="textarea"
              placeholder="Comment"
              rows={ 1 }
              value={ this.state.value.comment }
              onChange={ this.onChange.bind(this) }
            />
          </FormGroup>
        </div>
      </div>
    );
  }
}

PrimitiveEditor.propTypes = {
  dataIndex: PropTypes.number,
  value: PropTypes.array,
  change: PropTypes.func,
  remove: PropTypes.func
};

PrimitiveEditor.defaultProps = {
  dataIndex: -1,
  value: [],
  change: null,
  remove: null
};

export default PrimitiveEditor;
