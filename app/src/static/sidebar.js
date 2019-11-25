import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Sidebar from 'react-sidebar'


class SidebarMenu extends Component {
  constructor(props, context) {
    super(props, context)
    this.mql = window.matchMedia('(min-width: 800px)')

    this.mediaQueryChanged = this.mediaQueryChanged.bind(this)
    this.onSetSidebarOpen = this.onSetSidebarOpen.bind(this)

    this.state = {
      sidebarDocked: this.mql.matches,
      sidebarOpen: false
    }
  }

  componentDidMount() {
    this.mql.addListener(this.mediaQueryChanged)
  }

  componentWillUnmount() {
    this.mql.removeListener(this.mediaQueryChanged)
  }

  onSetSidebarOpen(open) {
    this.setState({
      sidebarOpen: open
    })
  }

  mediaQueryChanged() {
    this.setState({
      sidebarDocked: this.mql.matches,
      sidebarOpen: false
    })
  }

  // pass reference to this down to ThemeChooser component
  getChildContext() {
    return {
      sidebarOpen: this.state.sidebarOpen,
      sidebarDocked: this.state.sidebarDocked
    }
  }

  renderContents() {
    let toggle = <p>Toggle</p>
    return (
      <div id='sidebarContents'>
        { this.state.sidebarDocked ? '' : toggle }
        <p>Sidebar Contents</p>
      </div>
    )
  }

  render() {
    return (
      <Sidebar
        sidebar={ this.renderContents() }
        open={ this.state.sidebarOpen }
        docked={ this.state.sidebarDocked }
        onSetOpen={ this.onSetSidebarOpen }
        sidebarClassName='navbar-dark bg-dark'
      >
        { this.props.children || <span /> }
      </Sidebar>
    )
  }
}

SidebarMenu.childContextTypes = {
  sidebarOpen: PropTypes.bool,
  sidebarDocked: PropTypes.bool
}

export default SidebarMenu