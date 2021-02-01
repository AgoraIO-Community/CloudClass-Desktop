import React from 'react'

export interface PickerItemListProps {
  list: string[]
}

export const PickerItemList: React.FC<PickerItemListProps> = (props) => {
  return (
    <div></div>
  )
}

PickerItemList.defaultProps = {
  list: []
}