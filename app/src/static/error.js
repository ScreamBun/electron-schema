import React, { Component } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog } from '@fortawesome/free-solid-svg-icons'


class Error extends Component {
  constructor(props) {
    super(props)

    this.iconGeneral = {
      display: 'inline-block',
      width: 1+'em',
      height: 1+'em',
      fontSize: 4+'em',
      textAlign: 'center',
      position: 'absolute',
      top: 0,
      left: 0,
      MozAnimationDuration: 5+'s',
      OAnimationDuration: 5+'s',
      WebkitAnimationDuration: 5+'s',
      animationDuration: 5+'s'
    }

    this.reverseAnimation = {
      MozAnimationDirection: 'reverse',
      OAnimationDirection: 'reverse',
      WebkitAnimationDirection: 'reverse',
      animationDirection: 'reverse'
    }

    console.log('Whoop, there\'s an issue here!')
  }

  goBack() {
    if (this.props.history.length === 1) {
      console.log('Cant Go Back!!')
      console.error('Looks like this is a new tab, try closing it instead of going back')
    } else {
      console.log('Go Back!!')
      this.props.history.goBack()
    }
  }

  render() {
    return (
      <div className="jumbotron well col-md-10 col-12 mx-auto">
        <h1>Whoops</h1>
        <h3>This isn't a valid page, are you sure this is where you wanted to go?</h3>
        <div className='mx-auto' style={{
          height: 9+'em',
          width: 9+'em',
          fontSize: 1+'em',
          position: 'relative'
        }}>
          <FontAwesomeIcon
            icon={ faCog }
            spin
            style={ this.iconGeneral }
          />
          <FontAwesomeIcon
            icon={ faCog }
            spin
            style={{
              ...this.iconGeneral,
              ...this.reverseAnimation,
              fontSize: 6+'em',
              top: 0.53+'em',
              left: 0.25+'em'
            }}
          />
          <FontAwesomeIcon
            icon={ faCog }
            spin
            style={{
              ...this.iconGeneral,
              FontSize: 3+'em',
              top: 0.25+'em',
              left: 1.7+'em'
            }}
          />
        </div>
        <button className='btn btn-primary' onClick={ () => { this.goBack() } }>Go Back</button>
      </div>
    )
  }
}

export default Error
