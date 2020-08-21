import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Card, CardBody, CardHeader, TabPane
} from 'reactstrap';

import locale from 'react-json-editor/dist/locale/en';
import JADNInput from '../../../utils/jadn-editor';

// MarkDown Tab
const JADN = props => {
  const { minHeight, schema } = props;
  return (
    <TabPane tabId="jadn">
      <Card>
        <CardHeader>
          <span className="h3">JADN Schema</span>
        </CardHeader>
        <CardBody className="p-0">
          <JADNInput
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

JADN.propTypes = {
  minHeight: PropTypes.string,
  schema: PropTypes.object
};

JADN.defaultProps = {
  minHeight: '',
  schema: {}
};

const mapStateToProps = state => ({
  schema: state.convert.jadn_schema
});

export default connect(mapStateToProps)(JADN);
