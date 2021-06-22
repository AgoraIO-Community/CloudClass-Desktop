import React from 'react'
import { makeStyles, Theme } from '@material-ui/core'
import { Popover } from './index'

export default {
  title: 'Popover'
}

export const PopoverContainer = (props) => {
 return <Popover
          placement="bottom"
          overlay={<span>overlay</span>}
          visible={true}
        ><span>anchor</span></Popover>

}
PopoverContainer.args = {
}
