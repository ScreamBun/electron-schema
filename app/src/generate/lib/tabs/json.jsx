import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Card, CardBody, CardHeader, TabPane
} from 'reactstrap';

import JSONInput from 'react-json-editor';
import locale from 'react-json-editor/dist/locale/en';

// JSON Tab
const JSON = props => {
  const { minHeight, schema } = props;
  return (
    <TabPane tabId="json">
      <Card>
        <CardHeader>
          <span className="h3">JSON Schema</span>
        </CardHeader>
        <CardBody className="p-0">
          <JSONInput
            id="json_schema"
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

JSON.propTypes = {
  minHeight: PropTypes.string,
  schema: PropTypes.object
};

JSON.defaultProps = {
  minHeight: '',
  schema: {}
};

const mapStateToProps = state => ({
  schema: state.convert.json_schema
});

export default connect(mapStateToProps)(JSON);
