import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';

import KeyValueEditor from './key_value';

const ConfigKeys = {
  // $MaxBinary - Integer{1..*} optional
  $MaxBinary: {
    type: 'number',
    description: 'Schema default maximum number of octets'
  },
  // $MaxString - Integer{1..*} optional,
  $MaxString: {
    type: 'number',
    description: 'Schema default maximum number of characters'
  },
  // $MaxElements - Integer{1..*} optional,
  $MaxElements: {
    type: 'number',
    description: 'Schema default maximum number of items/properties'
  },
  // $FS - String{1..1} optional,
  $FS: {
    description: 'Field Separator character used in pathnames'
  },
  // $Sys - String{1..1} optional,
  $Sys: {
    description: 'System character for TypeName'
  },
  // $TypeName - String{1..127} optional,
  $TypeName: {
    description: 'TypeName regex'
  },
  // $FieldName - String{1..127} optional,
  $FieldName: {
    description: 'FieldName regex'
  },
  // $NSID - String{1..127} optional
  $NSID: {
    description: 'Namespace Identifier regex'
  }
};

// Config Editor
class ConfigEditor extends Component {
  constructor(props, context) {
    super(props, context);
    this.removeAll = this.removeAll.bind(this);

    const { value } = this.props;

    this.state = {
      ...value
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const propsChange = this.props !== nextProps;
    const stateChange = this.state !== nextState;

    if (this.state !== nextState) {
      const { change } = this.props;
      change(nextState);
    }
    return propsChange || stateChange;
  }

  onChange(k, v) {
    this.setState(prevState => {
      const ps = { ...prevState };
      if (v === '') {
        delete ps[k];
      } else {
        ps[k] = v;
      }
      return ps;
    });
  }

  removeAll() {
    const { id, remove } = this.props;
    remove(id.toLowerCase());
  }

  render() {
    const { id } = this.props;
    const keys = Object.keys(ConfigKeys).map(k => {
      const keyProps = {
        ...ConfigKeys[k],
        placeholder: k,
        change: v => this.onChange(k, v),
        removable: false
      };
      if (k in this.state) {
        keyProps.value = this.state[k];  // eslint-disable-line react/destructuring-assignment
      }
      return <KeyValueEditor key={ k } id={ k } { ...keyProps } />;
    });

    return (
      <div className="border m-1 p-1">
        <Button color="danger" size="sm" className="float-right" onClick={ this.removeAll } >
          <FontAwesomeIcon
            icon={ faMinusCircle }
          />
        </Button>
        <div className="border-bottom mb-2">
          <p className="col-sm-4 my-1"><strong>{ id }</strong></p>
        </div>
        <div className="col-12 m-0">
          { keys }
        </div>
      </div>
    );
  }
}

ConfigEditor.propTypes = {
  id: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.object,
  change: PropTypes.func,
  remove: PropTypes.func
};

ConfigEditor.defaultProps = {
  id: 'ConfigObjectEditor',
  placeholder: 'ConfigObjectEditor',
  value: {},
  change: val => null,  // eslint-disable-line no-unused-vars
  remove: id => null  // eslint-disable-line no-unused-vars
};

export default ConfigEditor;
