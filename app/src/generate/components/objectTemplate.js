import React from 'react'


const ObjectFieldTemplate = (props) => {
  return (
    <div className={ props.className }>
      { props.TitleField(props) }
      { props.DescriptionField(props) }

      <div className='row'>
        { props.properties.map(prop => (
          <div key={ prop.content.key } className='col-12'>
            { prop.content }
          </div>
        ))}
      </div>
    </div>
  )
}

export default ObjectFieldTemplate