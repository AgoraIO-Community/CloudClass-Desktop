import {createStyles, makeStyles, Theme} from '@material-ui/core/styles'
import React, { useState } from 'react'
import { useEffect } from "react"
import MicIcon from '../assets/wave-mic.png'

const useStyles = makeStyles((theme: Theme) => {
    const styles = createStyles({
        container: {
            display:'flex',
            position: 'relative',
            justifyContent:'center',
            alignItems: 'center',
            width:64,
            height:64
        },
        backDrop: {
            position: "absolute",
            width: '100%',
            height: '100%',
            margin: '0 auto',
            borderRadius: "50%",
            animation: "$wave 2s ease-out",
            animationIterationCount: 1,
            background: "#74C0FF"
        },
        backDropStatic: {
            position: "absolute",
            width: '100%',
            height: '100%',
            margin: '0 auto',
            borderRadius: "50%",
            background: "#74C0FF"
        },
        micIcon: {
            position: "absolute",
            width: '100%',
            height: '100%',
            background: `url(${MicIcon}) no-repeat`,
            zIndex: 5,
            backgroundSize:'35%',
            backgroundPosition: 'center'
        },
        "@keyframes wave": {
            "75%": {
            transform: "scale(1.5)"
            },
            "80%,100%": {
            opacity: 0
            }
        },
    })
    return styles
  })


export const MicWave = (props: any) => {
    const classes = useStyles()

    const {currentVolume, maxVolume = 100, threshold = 0.25} = props
    const [volumes, setVolumes] = useState([{volume:'0', ts: new Date().getTime()}])

    useEffect(() => {
        if(currentVolume > threshold * maxVolume) {
            let object = {volume: currentVolume, ts: new Date().getTime()}
            volumes.push(object)
            setVolumes(volumes)
        }
    }, [currentVolume])

    const onAnimationEnd = (ev:any) => {
        let ts = ev.currentTarget.id
        let value = volumes.filter(v => `${v.ts}` !== `${ts}`)
        setVolumes(value)
    }

    return (
        <div className={classes.container}>
            <div className={classes.micIcon}></div>
            <div className={classes.backDropStatic}></div>
            {volumes.map((volume) => <div key={volume.ts} id={`${volume.ts}`} className={classes.backDrop} onAnimationEnd={onAnimationEnd}></div>)}
        </div>
    )
  }