import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { Icon } from '~components/icon'
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
    SDKVersion = '3.3.0',
    classroomVersion = '1.0',
    onLookPrivate = () => {console.log('onLookPrivate')},
    onLookDeclare = () => {console.log('onLookDeclare')},
    onRegiste = () => {console.log('onRegiste')},
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
                <div className="about-header-title">{t('home.header-left-title')}</div>
                <div className="about-header-version">Version: Flexible Classroom_{version}</div>
            </div>
            <div className="about-main">
                <div className="about-main-item">
                    <div className="main-text">{t('home-about.privacy-policy')}</div>
                    <div className="main-desc main-operation operation-click" onClick={() => {
                        onLookPrivate && onLookPrivate()
                    }}><span>{t('home-about.check')} </span><Icon type="forward"/></div>
                </div>
                <div className="about-main-item">
                    <div className="main-text">{t('home-about.product-disclaimer')}</div>
                    <div className="main-desc main-operation operation-click" onClick={() => {
                        onLookDeclare && onLookDeclare()
                    }}><span>{t('home-about.check')}</span><Icon type="forward"/></div>
                </div>
                <div className="about-main-item">
                    <div className="main-text">{t('home-about.sign-up')}</div>
                    <div className="main-desc main-operation operation-click" onClick={() => {
                        onRegiste && onRegiste()
                    }}><span>{t('home-about.register')}</span><Icon type="forward"/></div>
                </div>
                <div className="about-main-item">
                    <div className="main-text">{t('home-about.version-time')}</div>
                    <div className="main-desc">{publishDate}</div>
                </div>
                <div className="about-main-item">
                    <div className="main-text">{t('home-about.sdk-version')}</div>
                    <div className="main-desc">{`Ver ${SDKVersion}`}</div>
                </div>
                <div className="about-main-item">
                    <div className="main-text">{t('home-about.classroom-version')}</div>
                    <div className="main-desc">{`Ver ${classroomVersion}`}</div>
                </div>
            </div>
        </div>
    )
}

export const Disclaimer: FC = () => {
    return (
        <div className="disclaimer">
            <div className="disclaimer-main">
                <p>{t('disclaimer.content-a')}</p>
                <p>{t('disclaimer.content-b')}</p>
                <p>{t('disclaimer.content-c')}</p>
            </div>
            <div className="disclaimer-footer">www.agora.io</div>
        </div>
    )
}