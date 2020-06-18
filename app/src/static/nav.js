import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Button,
  ButtonGroup,
  Collapse,
  Nav,
  Navbar,
  NavbarBrand,
  NavItem,
  NavLink
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { setActiveTab } from '../../store/actions/tabs';

import logo from '../../../resources/icon.png';

class NavBar extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      navOpen: false
    };
  }

  toggleNav() {
    this.setState(prevState => ({
      navOpen: !prevState.navOpen
    }));
  }

  render() {
    const navTabs = this.props.tabs.map(tab => (
      <NavItem key={ tab }>
        <NavLink
          className={ this.props.activeView === tab.toLowerCase() ? 'active' : '' }
          style={{ cursor: 'pointer' }}
          onClick={ () => this.props.setActiveTab(tab) }
        >{ tab }</NavLink>
      </NavItem>
    ));

    return (
      <Navbar color="primary" dark expand="md" fixed="top" >
        <div className="container-fluid">
          <NavbarBrand href="#">
            <img src={ logo } alt='OpenC2 Logo' style={{ paddingRight: 10 }}/>
            Schema Generator
          </NavbarBrand>
          <ButtonGroup>
            <Button
              className="navbar-toggler"
              type="button"
              color="info"
              data-toggle="collapse"
              aria-label="Toggle sidebar"
              onClick={ this.context.sidebarToggle }
            >
              <FontAwesomeIcon icon={ faEllipsisV } size="lg" className="mx-1" />
            </Button>
            <Button
              className="navbar-toggler"
              type="button"
              data-toggle="collapse"
              data-target="#navMain"
              aria-controls="navMain"
              aria-expanded="false"
              aria-label="Toggle navigation"
              onClick={ this.toggleNav.bind(this) }
            >
              <FontAwesomeIcon icon={ faBars } size="lg" />
            </Button>
          </ButtonGroup>
          <Collapse isOpen={ this.state.navOpen } navbar>
            <Nav className="mr-auto" navbar>
              { navTabs }
            </Nav>
          </Collapse>
        </div>
      </Navbar>
    );
  }
}

NavBar.propTypes = {
  activeView: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  tabs: PropTypes.arrayOf(PropTypes.string).isRequired
};

NavBar.contextTypes = {
  sidebarToggle: PropTypes.func
};

const mapStateToProps = state => ({
  activeView: state.tabs.activeView,
  tabs: state.tabs.tabs
});

const mapDispatchToProps = dispatch => ({
  setActiveTab: tab => dispatch(setActiveTab(tab))
});

export default connect(mapStateToProps, mapDispatchToProps)(NavBar);
