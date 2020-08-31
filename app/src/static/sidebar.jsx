import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Sidebar from 'react-sidebar';
import { Draggable } from 'react-drag-and-drop';
import {
  Card, CardBody, CardHeader, ListGroup, ListGroupItem
} from 'reactstrap';
import * as SchemaStructure from '../generate/lib/structure';

class SidebarMenu extends Component {
  constructor(props, context) {
    super(props, context);
    this.mediaQueryChanged = this.mediaQueryChanged.bind(this);
    this.toggleSidebar = this.toggleSidebar.bind(this);
    this.mql = window.matchMedia('(min-width: 768px)');

    this.state = {
      sidebarDocked: this.mql.matches,
      sidebarOpen: false,
      initCheck: false
    };
  }

  // pass reference to this down to child component
  getChildContext() {
    const { sidebarOpen, sidebarDocked } = this.state;
    return {
      sidebarDocked,
      sidebarOpen,
      sidebarToggle: () => this.toggleSidebar()
    };
  }

  componentDidMount() {
    this.mql.addListener(this.mediaQueryChanged);

    const { initCheck } = this.state;
    if (this.mql.matches && !initCheck) {
      this.setState({
        sidebarDocked: true,
        initCheck: true
      });
    }
  }

  componentWillUnmount() {
    this.mql.removeListener(this.mediaQueryChanged);
  }

  toggleSidebar(open) {
    this.setState(prevState => ({
      sidebarOpen: open || !prevState.sidebarOpen
    }));
  }

  mediaQueryChanged() {
    this.setState({
      sidebarDocked: this.mql.matches,
      sidebarOpen: false
    });
  }

  // eslint-disable-next-line class-methods-use-this
  renderContents() {
    const infoKeys = Object.keys(SchemaStructure.Info).map(k => (
      <Draggable type="info" data={ k } key={ k } >
        <ListGroupItem action>{ SchemaStructure.Info[k].key }</ListGroupItem>
      </Draggable>
    ));

    const typesKeys = Object.keys(SchemaStructure.Types).map(k => (
      <Draggable type="types" data={ k } key={ k } >
        <ListGroupItem action>{ SchemaStructure.Types[k].key }</ListGroupItem>
      </Draggable>
    ));

    return (
      <div>
        <Card>
          <CardHeader>Info</CardHeader>
          <CardBody>
            <ListGroup>
              { infoKeys }
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
    const { sidebarDocked, sidebarOpen } = this.state;

    return (
      <Sidebar
        sidebar={ this.renderContents() }
        open={ sidebarOpen }
        docked={ sidebarDocked }
        onSetOpen={ this.toggleSidebar }
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

export default SidebarMenu;
