import React from 'react'

const FieldTemplate = (props) => {
  const {id, label, help, required, description, errors, children} = props
  const classNames = props.classNames.split(' ').filter(i => i != 'form-group').join(' ')

  let name = ''
  if (id.match(/^root_.*?_/)) {
    name = <label htmlFor={ id } style={{ 'justifyContent': 'left' }}>
      <p id={ `${id}__name` } className='mb-0' >{ `${label}${required ? '*' : ''}` }</p>
    </label>
  }

  return (
    <div className={ `${classNames} mb-2` }>
      { name }
      { description }
      { children }
      { errors }
      { help }
    </div>
  )
}

export default FieldTemplate