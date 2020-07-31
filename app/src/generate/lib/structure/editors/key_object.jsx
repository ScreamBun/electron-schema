import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button, ButtonGroup, FormText, Input
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMinusCircle, faMinusSquare, faPlusSquare
} from '@fortawesome/free-solid-svg-icons';

// Key Object Editor
class KeyObjectEditor extends Component {
  constructor(props, context) {
    super(props, context);
    this.addIndex = this.addIndex.bind(this);
    this.onChange = this.onChange.bind(this);
    this.removeAll = this.removeAll.bind(this);
    this.removeIndex = this.removeIndex.bind(this);

    const { value } = this.props;
    this.state = {
      value: Object.keys(value).map(k => ({key: k, value: value[k]}))
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const propsChange = this.props !== nextProps;
    const stateChange = this.state !== nextState;

    const { value } = this.state;
    if (value !== nextState.value) {
      const { change } = this.props;
      change(this.toObject(nextState.value));
    }

    return propsChange || stateChange;
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

  toObject(val) {
    const { value } = this.state;
    return (val || value).reduce((obj, row) => ({
      ...obj,
      [row.key]: row.value
    }), {});
  }

  removeAll() {
    const { id, remove } = this.props;
    remove(id.toLowerCase());
  }

  removeIndex(e) {
    const { value } = this.state;
    if (value.length > 1) {
      const idx = parseInt(e.currentTarget.attributes.getNamedItem('data-index').value, 10);

      this.setState(prevState => ({
        value: prevState.value.filter((row, i) => i !== idx)
      }));
    } else {
      console.log('cant remove');
    }
  }

  addIndex() {
    const { value } = this.state;
    if (value.some(v => v[0] === '')) {
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

  render() {
    const { description, id, placeholder } = this.props;
    const { value } = this.state;

    const indices = value.map((obj, i) => (
      // eslint-disable-next-line react/no-array-index-key
      <div className="input-group col-sm-12 mb-1" key={ i }>
        <Input
          type="text"
          className="form-control"
          data-index={ i }
          data-type="key"
          placeholder={ placeholder }
          value={ obj.key }
          onChange={ this.onChange }
        />
        <Input
          type="text"
          className="form-control"
          data-index={ i }
          data-type="value"
          placeholder={ placeholder }
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
          <p className="col-sm-4 my-1"><strong>{ id }</strong></p>
          { description ? <FormText color='muted' className='ml-3'>{ description }</FormText> : '' }
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
  description: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.object,
  change: PropTypes.func,
  remove: PropTypes.func
};

KeyObjectEditor.defaultProps = {
  id: 'KeyObjectEditor',
  description: '',
  placeholder: 'KeyObjectEditor',
  value: {},
  change: null,
  remove: null
};

export default KeyObjectEditor;
