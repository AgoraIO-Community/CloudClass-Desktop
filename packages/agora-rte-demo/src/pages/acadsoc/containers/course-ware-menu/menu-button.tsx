import React from 'react'
import { Button, ButtonBase, IconButton } from '@material-ui/core'
import styles from './style.module.scss'
import CloseIcon from '@material-ui/icons/Close';

type ResourceMenuProps = {
  active: number
  items: any[]
  onClick: (rootPath: string, currentPage: number, type: string) => void
}

export const MenuButton = (props: any) => {
  return (
    <div onClick={props.onClick} className={`${styles.menuButton} ${props.className}`}>
      <div>{props.name}</div>
      {props.showClose ? <div onClick={props.onClose} style={{ height: '15px', position: 'absolute', right: '5px', top: '8px'}}>
        <CloseIcon style={{fontSize: '14px'}}></CloseIcon>
      </div> : null}
    </div>
  )
}

export const CourseWareMenu: React.FC<ResourceMenuProps> = (
  {
    items,
    active,
    onClick,
  }
) => {
  return (    
    <div className={styles.courseMenu}>
        {items.map((it, key: number) => (
          <MenuButton key={key}
            name={it.file.name}
            showClose={key === 0 ? false : true}
            className={`${styles.courseMenuItem} ${active === key ? styles.active : ''}`}
            onClick={() => {
              onClick(it.resourceName, it.currentPage, 'open')
            }}
            onClose={() => {
              onClick(it.resourceName, it.currentPage, 'close')
            }}
          >
          </MenuButton>
        ))}
    </div>
  )
}