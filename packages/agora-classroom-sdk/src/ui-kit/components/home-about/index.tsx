import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import './index.css';
import { t } from '~components/i18n';

export interface HomeAboutProps extends BaseProps {
    version?: string;
    publishDate?: string;
    SDKVersion?: string;
    classroomVersion?: string;
    onLookPrivate?: Function;
    onLookDeclare?: Function;
    onRegiste?: Function;
}

export const HomeAbout: FC<HomeAboutProps> = ({
    version = '1.1.0',
    publishDate = '2021.02.22',
    SDKVersion = 'Ver 3.3.0',
    classroomVersion = 'Ver 1.0',
    onLookPrivate,
    onLookDeclare,
    onRegiste,
    className,
    ...restProps
}) => {
    const cls = classnames({
        [`home-about`]: 1,
        [`${className}`]: !!className,
    });
    return (
        <div className={cls} {...restProps}>
            <div className="about-header">
                <div className="about-header-logo"></div>
                <div className="about-header-title">声网灵动课堂</div>
                <div className="about-header-version">Version: Flexible Classroom_{version}</div>
            </div>
            <div className="about-main">
                <div className="about-main-item">
                    <div className="main-text">隐私条例</div>
                    <div className="main-desc main-operation">查看 &gt;</div>
                </div>
                <div className="about-main-item">
                    <div className="main-text">免责声明</div>
                    <div className="main-desc main-operation">查看 &gt;</div>
                </div>
                <div className="about-main-item">
                    <div className="main-text">注册声网账号</div>
                    <div className="main-desc main-operation">注册 &gt;</div>
                </div>
                <div className="about-main-item">
                    <div className="main-text">发版时间</div>
                    <div className="main-desc">{publishDate}</div>
                </div>
                <div className="about-main-item">
                    <div className="main-text">SDK版本</div>
                    <div className="main-desc">{SDKVersion}</div>
                </div>
                <div className="about-main-item">
                    <div className="main-text">灵动课堂版本</div>
                    <div className="main-desc">{classroomVersion}</div>
                </div>
            </div>
        </div>
    )
}