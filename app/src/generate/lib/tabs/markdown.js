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
    return (
      <TabPane tabId="markdown">
        <Card>
          <CardHeader>
            <span className="h3">MarkDown</span>
            <ButtonGroup className="float-right">
              <Button
                active={ this.state.activeTab === 'text' }
                onClick={ this.toggleTabs.bind(this) }
              >
                <FontAwesomeIcon icon={ faCode } />
              </Button>
              <Button
                active={ this.state.activeTab === 'render' }
                onClick={ this.toggleTabs.bind(this) }
              >
                <FontAwesomeIcon icon={ faFileAlt } />
              </Button>
            </ButtonGroup>
          </CardHeader>
          <CardBody>
            <TabContent activeTab={ this.state.activeTab }>
              <TabPane tabId="text">
                <pre>
                  { this.props.schema }
                </pre>
              </TabPane>
              <TabPane tabId="render">
                <ReactMarkdown source={ this.props.schema } />
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
