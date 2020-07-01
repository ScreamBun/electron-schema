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

// Key Object Editor
class KeyObjectEditor extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      ...this.props.value
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const propsChange = this.props !== nextProps;
    const stateChange = this.state !== nextState;

    if (this.state !== nextState) {
      this.props.change(nextState);
    }
    return propsChange || stateChange;
  }

  removeAll() {
    this.props.remove(this.props.id.toLowerCase());
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

  render() {
    const keys = Object.keys(ConfigKeys).map(k => {
      const keyProps = {
        ...ConfigKeys[k],
        placeholder: k,
        change: v => this.onChange(k, v),
        removable: false
      };
      if (k in this.state) {
        keyProps.value = this.state[k];
      }
      return <KeyValueEditor key={ k } id={ k } { ...keyProps } />;
    });

    return (
      <div className="border m-1 p-1">
        <Button color="danger" size="sm" className="float-right" onClick={ this.removeAll.bind(this) } >
          <FontAwesomeIcon
            icon={ faMinusCircle }
          />
        </Button>
        <div className="border-bottom mb-2">
          <p className="col-sm-4 my-1"><strong>{ this.props.id }</strong></p>
        </div>
        <div className="col-12 m-0">
          { keys }
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
  id: 'ConfigObjectEditor',
  placeholder: 'ConfigObjectEditor',
  value: {},
  change: null,
  remove: null
};

export default KeyObjectEditor;