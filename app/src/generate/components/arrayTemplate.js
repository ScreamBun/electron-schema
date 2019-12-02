import React from 'react'

import {
  Button
} from 'reactstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMinus, faMinusSquare, faPlus, faPlusSquare } from '@fortawesome/free-solid-svg-icons'

const ArrayFieldTemplate = (props) => {
  let indexes = props.items.map(itm => (
    <div key={ itm.key } className={ itm.className }>
      <div>{ itm.children }</div>
      {itm.hasMoveDown && (
        <Button color='warning' outline onClick={ itm.onReorderClick(itm.index, itm.index + 1) }>
          <FontAwesomeIcon icon={ faMinusSquare }/>
        </Button>
      )}
      {itm.hasMoveUp && (
        <Button color='primary' outline onClick={ itm.onReorderClick(itm.index, itm.index - 1) }>
          <FontAwesomeIcon icon={ faPlusSquare } />
        </Button>
      )}
      <Button color='danger' onClick={ itm.onDropIndexClick(itm.index) }>
        <FontAwesomeIcon icon={ faMinus } />
      </Button>
      <hr />
    </div>
  ))

  return (
    <div className={ props.className }>
      { props.TitleField(props) }
      { props.DescriptionField(props) }
      { indexes }
      {props.canAdd && (
        <div className="row">
          <Button color='primary' onClick={ props.onAddClick }>
            <FontAwesomeIcon icon={ faPlus } />
          </Button>
        </div>
      )}
    </div>
  )
}

export default ArrayFieldTemplate