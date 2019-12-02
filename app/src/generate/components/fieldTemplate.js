import React from 'react'

const FieldTemplate = (props) => {
  const {id, classNames, label, help, required, description, errors, children} = props;
  return (
    <div className={ classNames }>
      <label htmlFor={ id }>{ label }{ required ? "*" : '' }</label>
      { description }
      { children }
      { errors }
      { help }
    </div>
  )
}

export default FieldTemplate