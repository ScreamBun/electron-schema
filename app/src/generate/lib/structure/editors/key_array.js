import React from 'react';
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

// Key Array Editor
const KeyArrayEditor = props => {
  const removeAll = () => props.remove(props.id.toLowerCase());

  const removeIndex = e => {
    if (props.value.length > 1) {
      const index = e.currentTarget.attributes.getNamedItem('data-index').value;
      const tmpValues = [ ...props.value ];
      tmpValues.splice(index, 1);
      props.change(tmpValues);
    }
  };

  const addIndex = () => props.change([ ...props.value, '' ]);

  const onChange = e => {
    const index = e.target.attributes.getNamedItem('data-index').value;
    const value = e.target.value;
    const tmpValues = [ ...props.value ];
    tmpValues[index] = value;
    props.change(tmpValues);
  };

  const indices = props.value.map((arr, i) => (
    // eslint-disable-next-line react/no-array-index-key
    <div className="input-group col-sm-12 mb-1" key={ i }>
      <Input
        type="text"
        className="form-control"
        data-index={ i }
        placeholder={ props.placeholder }
        value={ arr }
        onChange={ onChange }
      />
      <div className="input-group-append">
        <Button color='danger' onClick={ removeIndex } data-index={ i }>
          <FontAwesomeIcon icon={ faMinusSquare } />
        </Button>
      </div>
    </div>
  ));

  return (
    <div className="border m-1 p-1">
      <ButtonGroup size="sm" className="float-right">
        <Button color="info" onClick={ addIndex } >
          <FontAwesomeIcon icon={ faPlusSquare } />
        </Button>
        <Button color="danger" onClick={ removeAll } >
          <FontAwesomeIcon icon={ faMinusCircle } />
        </Button>
      </ButtonGroup>

      <div className="border-bottom mb-2">
        <p className="col-sm-4 my-1"><strong>{ props.id }</strong></p>
      </div>

      <div className="row m-0 indices">
        { indices }
      </div>
    </div>
  );
};

KeyArrayEditor.propTypes = {
  id: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.array,
  change: PropTypes.func,
  remove: PropTypes.func
};

KeyArrayEditor.defaultProps = {
  id: 'KeyValueEditor',
  placeholder: 'KeyValueEditor',
  value: {},
  change: null,
  remove: null
};

export default KeyArrayEditor;
