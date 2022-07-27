import { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~ui-kit/components/util/type';
import './index.css';
import { SvgIconEnum, SvgImg } from '../svg-img';
import { useI18n } from '../i18n';

export interface HomeAboutProps extends BaseProps {
  version?: string;
  SDKVersion?: string;
  classroomVersion?: string;
  onLookPrivate?: Function;
  onLookDeclare?: Function;
  onRegiste?: Function;
  commitID?: string;
  buildTime?: string;
}

export const HomeAbout: FC<HomeAboutProps> = ({
  version = '',
  buildTime = '',
  SDKVersion = '',
  classroomVersion = '',
  commitID = '',
  onLookPrivate = () => {
    console.log('onLookPrivate');
  },
  onLookDeclare = () => {
    console.log('onLookDeclare');
  },
  onRegiste = () => {
    console.log('onRegiste');
  },
  className,
  ...restProps
}) => {
  const t = useI18n();
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
          <div
            className="main-desc main-operation operation-click"
            onClick={() => {
              onLookPrivate && onLookPrivate();
            }}>
            <span>{t('home-about.check')} </span>
            <SvgImg type={SvgIconEnum.FORWARD} />
          </div>
        </div>
        <div className="about-main-item">
          <div className="main-text">{t('home-about.product-disclaimer')}</div>
          <div
            className="main-desc main-operation operation-click"
            onClick={() => {
              onLookDeclare && onLookDeclare();
            }}>
            <span>{t('home-about.check')}</span>
            <SvgImg type={SvgIconEnum.FORWARD} />
          </div>
        </div>
        <div className="about-main-item">
          <div className="main-text">{t('home-about.sign-up')}</div>
          <div
            className="main-desc main-operation operation-click"
            onClick={() => {
              onRegiste && onRegiste();
            }}>
            <span>{t('home-about.register')}</span>
            <SvgImg type={SvgIconEnum.FORWARD} />
          </div>
        </div>
        <div className="about-main-item">
          <div className="main-text">{t('home-about.sdk-version')}</div>
          <div className="main-desc">{`Ver ${SDKVersion}`}</div>
        </div>
        <div className="about-main-item">
          <div className="main-text">{t('home-about.classroom-version')}</div>
          <div className="main-desc">{`Ver ${classroomVersion}`}</div>
        </div>
        {buildTime && (
          <div className="about-main-item">
            <div className="main-text">{t('home-about.build-time')}</div>
            <div className="main-desc">{`${buildTime}`}</div>
          </div>
        )}
        {commitID && (
          <div className="about-main-item">
            <div className="main-text">{t('home-about.commit-id')}</div>
            <div className="main-desc">{`${commitID}`.substring(0, 10)}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export const Disclaimer: FC = () => {
  const t = useI18n();
  return (
    <div className="disclaimer">
      <div className="disclaimer-main">
        <p>{t('disclaimer.content-a')}</p>
        <p>{t('disclaimer.content-b')}</p>
        <p>{t('disclaimer.content-c')}</p>
      </div>
      <div className="disclaimer-footer">www.agora.io</div>
    </div>
  );
};
