import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { Progress } from '~components/progress'
import './index.css';

import loadingGif from './assets/loading.gif';
// import circleLoadingGif from './assets/circle-loading.gif';

export interface LoadingProps extends BaseProps {
    hasLoadingGif?: boolean; 
    loadingText?: string;
    hasProgress?: boolean;
    currentProgress?: number;
    footer?: React.ReactNode[];
}

export const Loading: FC<LoadingProps> = ({
    hasLoadingGif = true,
    loadingText = "",
    hasProgress = false,
    currentProgress = 0.5,
    footer = [],
    className,
    ...restProps
}) => {
    const cls = classnames({
        [`loading`]: 1,
        [`${className}`]: !!className,
    });
    return (
        <div className={cls} {...restProps}>
            {hasLoadingGif ? <img src={loadingGif} width="60" height="60" style={{marginBottom: 4}} alt="loading gif"/> : ""}
            {loadingText ? <span className="loading-text">{loadingText}</span> : ""}
            {hasProgress ? (
                <div className="loading-progress">
                    <Progress width={160} type="download" progress={currentProgress}/>
                    <span className="loading-progress-number">{currentProgress * 100}%</span>
                </div>
            ) : ""}
            {(footer && footer.length) ? (
                <div className="loading-btn-line">
                    {footer.map((item: any, index) => (
                        <span key={index} style={{margin: '0px 5px'}}>
                            {React.cloneElement(item, {})}
                        </span>
                    ))}
                </div>
            ) : ""}
        </div>
    )
}