import { t } from '@/i18n'
import { observer } from 'mobx-react'
import React from 'react'
import styles from './style.module.scss'

type SignalProps = {
  level: number,
}

export const SignalBar = observer((props: SignalProps) => {
  const {level} = props
  return(
    <div className={styles.signal}>
      {
        level === 3?
        <div className={styles.signalGood}>
          <div className={styles.signal}></div>
          <span className={styles.text}>{t('nav.signal_good')}</span> 
        </div>
        : level === 2?
        <div className={styles.signalWeak}>
          <div className={styles.signal}></div> 
          <span className={styles.text}>{t('nav.signal_weak')}</span>
        </div> 
        : level === 1?
        <div className={styles.signalBad}>
          <div className={styles.signal}></div> 
          <span className={styles.text}>{t('nav.signal_bad')}</span>
        </div> 
        : 
        <div className={styles.signalUnknown}>
          <div className={styles.signal}></div> 
          <span className={styles.text}>{t('nav.signal_unknown')}</span>
        </div> 
      }
    </div>
  )
})