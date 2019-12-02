import React from 'react'

const DescriptionField = (props) => {
  let desc = ''
  if (props.description) {
    desc = <p id={ props.id } className='text-muted'>{ props.description }</p>
  }
  return desc
}

export {
  DescriptionField
}