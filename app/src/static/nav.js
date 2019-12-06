import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome } from '@fortawesome/free-solid-svg-icons'

import logo from '../../resources/images/openc2-logo.png'

class Nav extends Component {
  constructor(props, context) {
    super(props, context)
  }

  render() {
    return (
      <nav className="navbar navbar-expand-md navbar-dark bg-primary fixed-top" ref={ (elm) => this.navContainer = elm}>
        <a className="navbar-brand" href="#">
          <img src={ logo } alt='OpenC2 Logo' />
        </a>
        <button className="navbar-toggler" type="button" onClick={ () => this.context.sidebarToggle() } >
          <span className="navbar-toggler-icon"></span>
        </button>
      </nav>
    )
  }
}

Nav.contextTypes = {
  sidebarToggle: PropTypes.func
}

export default connect()(Nav)
