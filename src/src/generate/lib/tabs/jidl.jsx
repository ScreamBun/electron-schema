import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Card, CardBody, CardHeader, TabPane
} from 'reactstrap';

import locale from 'react-json-editor/dist/locale/en';
import JIDLInput from '../../../utils/jidl-editor';

// JIDL Tab
const JIDL = props => {
  const { minHeight, schema } = props;
  return (
    <TabPane tabId="jidl" className="scroll-tab">
      <Card>
        <CardHeader>
          <span className="h3">JIDL Schema</span>
        </CardHeader>
        <CardBody className="p-0">
          <JIDLInput
            id="jadn_schema"
            placeholder={ schema }
            theme="light_mitsuketa_tribute"
            locale={ locale }
            // reset
            height="100%"
            width="100%"
            viewOnly
            // waitAfterKeyPress={ 500 }
            style={{
              outerBox: { minHeight }
            }}
          />
        </CardBody>
      </Card>
    </TabPane>
  );
};

JIDL.propTypes = {
  minHeight: PropTypes.string,
  schema: PropTypes.string
};

JIDL.defaultProps = {
  minHeight: '',
  schema: ''
};

const mapStateToProps = state => ({
  schema: state.convert.jidl_schema
});

export default connect(mapStateToProps)(JIDL);
