import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import qs from 'query-string'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome } from '@fortawesome/free-solid-svg-icons'

import logo from '../../resources/images/openc2-logo.png'

class NavItem extends Component {
  constructor(props, context) {
    super(props, context)
    this.external = this.props.external || false
    this.dropdown = this.props.dropdown || false
  }

  render() {
    let active = (this.props.href === this.props.active)
    let href = (this.props.href || '').endsWith('/') ? this.props.href : this.props.href + '/'

    return (
      <li onClick={ this.external ? () => {} : this.props.click } className={ this.props.liClassName + active ? ' active' : '' } >
        <a href={ href } target={ this.props.target } onClick={ this.external ? () => {} : (e) => { e.preventDefault() } } className={ this.dropdown ? 'dropdown-item' : 'nav-link' } >
          { this.props.icon ? <FontAwesomeIcon icon={ this.props.icon } size='lg' /> : '' } { this.props.text }
        </a>
      </li>
    );
  }
}

class Nav extends Component {
  constructor(props, context) {
    super(props, context)
    let act = (this.props.history.location.pathname === this.prefix)

    this.navContainer = null
    this.leftNavContainer = null
    this.rightNavContainer = null
    this.navigate = this.navigate.bind(this)
    this.setSize = this.setSize.bind(this)

    this.themeOptionStyles = {
      position: 'fixed',
      bottom: '5px',
      right: '5px'
    }

    this.state = {
      active: (act ? '/' : this.props.history.location.pathname),
    }
  }

  setSize() {
    setTimeout(() => {
      if (!this.navContainer) { return; }
      let padding = 0
      let height = this.navContainer.getBoundingClientRect().height

      if (this.context.sidebarDocked) {
        let sidebarWidth = document.getElementById("sidebarContents").getBoundingClientRect().width
        padding = sidebarWidth - this.leftNavContainer.getBoundingClientRect().left
        if (padding > 0) {
          this.leftNavContainer.style.paddingLeft = (padding + 5) + 'px'
        }
        document.getElementById("sidebarContents").style.paddingTop = (height + 10) + 'px'
      }
      document.getElementById("contents").style.paddingTop = (height + 10) + 'px'
    }, 100)
  }

  navigate(e) {
    e.preventDefault()
    if (e.target.href === null || e.target.href === undefined ) { return }

    console.log(window.location)

    let href = e.target.href.replace(window.location.origin, '')
    let query = {}

    this.props.history.push({
      pathname: href,
      search: qs.stringify(query)
    })

    this.setState({ active: href })
  }

  leftNav() {
    return (
      <ul className="nav navbar-nav mr-auto" ref={ (elm) => this.leftNavContainer = elm}>
        <NavItem href="/" text="Home" active={ this.state.active } click={ this.navigate }/>
        {/* <NavItem href="/orchestrator" text="Orchestrators" active={ this.state.active } click={ this.navigate.bind(this) }/> */}
        <NavItem href="/device" text="Devices" active={ this.state.active } click={ this.navigate }/>
        <NavItem href="/actuator" text="Actuators" active={ this.state.active } click={ this.navigate }/>
        <NavItem href="/command" text="Commands" active={ this.state.active } click={ this.navigate }/>
        <NavItem href="/command/generate" text="Command Generator" active={ this.state.active } click={ this.navigate }/>
      </ul>
    )
  }

  rightNav() {
    return (
      <ul className="nav navbar-nav ml-auto" ref={ (elm) => this.rightNavContainer = elm}>
        <li className="nav-item dropdown">
        </li>
      </ul>
    )
  }

  render() {
    this.setSize()
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top" ref={ (elm) => this.navContainer = elm}>
        <a className="navbar-brand" href="#">
          <img src={ logo } alt='OpenC2 Logo' />
        </a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navMain" aria-controls="navMain" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navMain">
          { this.leftNav() }
          { this.rightNav() }
        </div>
      </nav>
    )
  }
}

Nav.contextTypes = {
  sidebarOpen: PropTypes.bool,
  sidebarDocked: PropTypes.bool
}

export default connect()(Nav)
