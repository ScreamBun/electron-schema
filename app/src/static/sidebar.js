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
    this.mql = window.matchMedia('(min-width: 768px)');

    this.mediaQueryChanged = this.mediaQueryChanged.bind(this);
    this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this);

    this.state = {
      sidebarDocked: this.mql.matches,
      sidebarOpen: false
    };

    this.keys = SchemaStructure;
  }

  // pass reference to this down to child component
  getChildContext() {
    return {
      sidebarDocked: this.state.sidebarDocked,
      sidebarOpen: this.state.sidebarOpen,
      sidebarToggle: () => this.onSetSidebarOpen(!this.state.sidebarOpen)
    };
  }

  componentDidMount() {
    this.mql.addListener(this.mediaQueryChanged);
  }

  componentWillUnmount() {
    this.mql.removeListener(this.mediaQueryChanged);
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
    return (
      <Sidebar
        sidebar={ this.renderContents() }
        open={ this.state.sidebarOpen }
        docked={ this.state.sidebarDocked }
        onSetOpen={ this.onSetSidebarOpen }
        sidebarClassName="navbar-dark bg-dark"
        rootId="sidebarRoot"
        sidebarId="sidebarContents"
        contentId="sidebarMain"
        overlayId="sidebarOverlay"
      >
        { this.props.children || <span /> }
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
