import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  ButtonGroup,
  Input
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMinusCircle,
  faMinusSquare,
  faPlusSquare
} from '@fortawesome/free-solid-svg-icons';

// Key Object Editor
class KeyObjectEditor extends Component {
  constructor(props, context) {
    super(props, context);

    this.removeAll = this.removeAll.bind(this);
    this.removeIndex = this.removeIndex.bind(this);
    this.addIndex = this.addIndex.bind(this);
    this.onChange = this.onChange.bind(this);

    this.state = {
      value: Object.keys(this.props.value).map(k => ({key: k, value: this.props.value[k]}))
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const propsChange = this.props !== nextProps;
    const stateChange = this.state !== nextState;

    if (this.state.value !== nextState.value) {
      this.props.change(this.toObject(nextState.value));
    }

    return propsChange || stateChange;
  }

  toObject(val) {
    val = val || this.state.value;
    return val.reduce((obj, row) => ({
      ...obj,
      [row.key]: row.value
    }), {});
  }

  removeAll() {
    this.props.remove(this.props.id.toLowerCase());
  }

  removeIndex(e) {
    if (this.state.value.length > 1) {
      const idx = parseInt(e.currentTarget.attributes.getNamedItem('data-index').value, 10);

      this.setState(prevState => ({
        value: prevState.value.filter((row, i) => i !== idx)
      }));
    } else {
      console.log('cant remove');
    }
  }

  addIndex() {
    if (this.state.value.some(v => v[0] === '')) {
      return;
    }
    console.log('Add KeyObject');

    this.setState(prevState => ({
      value: [
        ...prevState.value,
        {
          key: '',
          value: ''
        }
      ]
    }));
  }

  onChange(e) {
    const idx = parseInt(e.target.attributes.getNamedItem('data-index').value, 10);
    const type = e.target.attributes.getNamedItem('data-type').value;
    const val = e.target.value;
    console.log('Update KeyObject');

    this.setState(prevState => {
      const tmpvalue = [ ...prevState.value ];
      tmpvalue[idx][type] = val;
      return {
        value: tmpvalue
      };
    });
  }

  render() {
    const indices = this.state.value.map((obj, i) => (
      <div className="input-group col-sm-12 mb-1" key={ i }>
        <Input
          type="text"
          className="form-control"
          data-index={ i }
          data-type="key"
          placeholder={ this.props.placeholder }
          value={ obj.key }
          onChange={ this.onChange }
        />
        <Input
          type="text"
          className="form-control"
          data-index={ i }
          data-type="value"
          placeholder={ this.props.placeholder }
          value={ obj.value }
          onChange={ this.onChange }
        />
        <div className="input-group-append">
          <Button color="danger" onClick={ this.removeIndex } data-index={ i }>
            <FontAwesomeIcon icon={ faMinusSquare } />
          </Button>
        </div>
      </div>
    ));

    return (
      <div className="border m-1 p-1">
        <ButtonGroup size="sm" className="float-right">
          <Button color="info" onClick={ this.addIndex } >
            <FontAwesomeIcon
              icon={ faPlusSquare }
            />
          </Button>
          <Button color="danger" onClick={ this.removeAll } >
            <FontAwesomeIcon icon={ faMinusCircle } />
          </Button>
        </ButtonGroup>
        <div className="border-bottom mb-2">
          <p className="col-sm-4 my-1"><strong>{ this.props.id }</strong></p>
        </div>
        <div className="row m-0 indices">
          { indices }
        </div>
      </div>
    );
  }
}

KeyObjectEditor.propTypes = {
  id: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.object,
  change: PropTypes.func,
  remove: PropTypes.func
};

KeyObjectEditor.defaultProps = {
  id: 'KeyObjectEditor',
  placeholder: 'KeyObjectEditor',
  value: {},
  change: null,
  remove: null
};

export default KeyObjectEditor;
