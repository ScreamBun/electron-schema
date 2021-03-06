import React, { Component } from 'react';
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  TabContent,
  TabPane
} from 'reactstrap';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactMarkdown from 'react-markdown';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faFileAlt } from '@fortawesome/free-solid-svg-icons';

// MarkDown Tab
class MarkDown extends Component {
  constructor(props, context) {
    super(props, context);
    this.toggleTabs = this.toggleTabs.bind(this);

    this.state = {
      activeTab: 'render'
    };
  }

  toggleTabs() {
    this.setState(prevState => ({
      activeTab: prevState.activeTab === 'text' ? 'render' : 'text'
    }));
  }

  render() {
    const { schema } = this.props;
    const { activeTab } = this.state;

    return (
      <TabPane tabId="markdown">
        <Card>
          <CardHeader>
            <span className="h3">MarkDown</span>
            <ButtonGroup className="float-right">
              <Button
                active={ activeTab === 'text' }
                onClick={ this.toggleTabs }
              >
                <FontAwesomeIcon icon={ faCode } />
              </Button>
              <Button
                active={ activeTab === 'render' }
                onClick={ this.toggleTabs }
              >
                <FontAwesomeIcon icon={ faFileAlt } />
              </Button>
            </ButtonGroup>
          </CardHeader>
          <CardBody>
            <TabContent activeTab={ activeTab }>
              <TabPane tabId="text">
                <pre>
                  { schema }
                </pre>
              </TabPane>
              <TabPane tabId="render">
                <ReactMarkdown source={ schema } />
              </TabPane>
            </TabContent>
          </CardBody>
        </Card>
      </TabPane>
    );
  }
}

MarkDown.propTypes = {
  schema: PropTypes.string
};

MarkDown.defaultProps = {
  schema: ''
};

const mapStateToProps = state => ({
  schema: state.convert.md_schema
});

export default connect(mapStateToProps)(MarkDown);
