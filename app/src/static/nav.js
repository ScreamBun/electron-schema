import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import logo from '../../resources/images/openc2-logo.png';

const Nav = (props, context) => (
  <nav className="navbar navbar-expand-md navbar-dark bg-primary fixed-top" >
    <a className="navbar-brand" href="#">
      <img src={ logo } alt='OpenC2 Logo' />
    </a>
    <button
      className="navbar-toggler"
      type="button"
      onClick={ () => context.sidebarToggle() }
    >
      <span className="navbar-toggler-icon" />
    </button>
  </nav>
);

Nav.contextTypes = {
  sidebarToggle: PropTypes.func
};

export default connect()(Nav);
