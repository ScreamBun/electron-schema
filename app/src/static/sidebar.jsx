import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Sidebar from 'react-sidebar';
import { Draggable } from 'react-drag-and-drop';

import {
  Card,
  CardBody,
  CardHeader,
  ListGroup,
  ListGroupItem
} from 'reactstrap';

import SchemaStructure from '../generate/lib/structure';

class SidebarMenu extends Component {
  constructor(props, context) {
    super(props, context);
    this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);
    this.mql = window.matchMedia('(min-width: 768px)');

    this.state = {
      sidebarDocked: this.mql.matches,
      sidebarOpen: false,
      initCheck: false
    };

    this.keys = SchemaStructure;
  }

  // pass reference to this down to child component
  getChildContext() {
    const {sidebarOpen, sidebarDocked } = this.state;
    return {
      sidebarDocked,
      sidebarOpen,
      sidebarToggle: () => this.onSetSidebarOpen(!sidebarOpen)
    };
  }

  componentDidMount() {
    this.mql.addListener(this.mediaQueryChanged.bind(this));
  }

  componentWillUnmount() {
    this.mql.removeListener(this.mediaQueryChanged.bind(this));
  }

  onSetSidebarOpen(open) {
    this.setState({
      sidebarOpen: open
    });
  }

  mediaQueryChanged() {
    this.setState({
      sidebarDocked: this.mql.matches,
      sidebarOpen: false
    });
  }

  renderContents() {
    const metaKeys = Object.keys(this.keys.meta).map(k => (
      <Draggable type="meta" data={ k } key={ k } >
        <ListGroupItem action>{ this.keys.meta[k].key }</ListGroupItem>
      </Draggable>
    ));

    const typesKeys = Object.keys(this.keys.types).map(k => (
      <Draggable type="types" data={ k } key={ k } >
        <ListGroupItem action>{ this.keys.types[k].key }</ListGroupItem>
      </Draggable>
    ));

    return (
      <div>
        <Card>
          <CardHeader>Meta</CardHeader>
          <CardBody>
            <ListGroup>
              { metaKeys }
            </ListGroup>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>Types</CardHeader>
          <CardBody>
            <ListGroup>
              { typesKeys }
            </ListGroup>
          </CardBody>
        </Card>
      </div>
    );
  }

  render() {
    const { children } = this.props;
    const { initCheck, sidebarDocked, sidebarOpen } = this.state;
    if (this.mql.matches && !initCheck) {
      setTimeout(() => this.setState({
        sidebarDocked: true,
        initCheck: true
      }), 10);
    }

    return (
      <Sidebar
        sidebar={ this.renderContents() }
        open={ sidebarOpen }
        docked={ sidebarDocked }
        onSetOpen={ this.onSetSidebarOpen }
        sidebarClassName="navbar-dark bg-dark"
        rootId="sidebarRoot"
        sidebarId="sidebarContents"
        contentId="sidebarMain"
        overlayId="sidebarOverlay"
      >
        { children || <span /> }
      </Sidebar>
    );
  }
}

SidebarMenu.propTypes = {
  children: PropTypes.element
};

SidebarMenu.defaultProps = {
  children: null
};

SidebarMenu.childContextTypes = {
  sidebarDocked: PropTypes.bool,
  sidebarOpen: PropTypes.bool,
  sidebarToggle: PropTypes.func
};

export default connect()(SidebarMenu);
