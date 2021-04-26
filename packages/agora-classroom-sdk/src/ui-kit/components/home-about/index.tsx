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
                    <div className="main-desc main-operation" onClick={() => {
                        onLookPrivate && onLookPrivate()
                    }}>查看 &gt;</div>
                </div>
                <div className="about-main-item">
                    <div className="main-text">免责声明</div>
                    <div className="main-desc main-operation" onClick={() => {
                        onLookDeclare && onLookDeclare()
                    }}>查看 &gt;</div>
                </div>
                <div className="about-main-item">
                    <div className="main-text">注册声网账号</div>
                    <div className="main-desc main-operation" onClick={() => {
                        onRegiste && onRegiste()
                    }}>注册 &gt;</div>
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

export const Disclaimer: FC = () => {
    return (
        <div className="disclaimer">
            <div className="disclaimer-main">
                <p>灵动课堂（“本产品”）是由上海兆言网络科技有限公司（“上海兆言”）提供的一款测试产品，上海兆言享有本产品的著作权和所有权。特此免费授予获得本产品和相关文档文件（以下简称“软件”）副本的任何人无限制地使用软件的权利，包括但不限于使用，复制，修改，合并，发布，分发，但本产品不得用于任何商业用途，不得再许可和/或出售该软件的副本。 </p>
                <p>本产品按“现状”提供，没有任何形式的明示担保，包括但不限于对适配性、特定目的的适用性和非侵权性的担保。无论是由于与本产品或本产品的使用或其他方式有关的任何合同、侵权或其他形式的行为，上海兆言均不对任何索赔、损害或其他责任负责。 </p>
                <p>您可以自由选择是否使用本产品提供的服务，如果您下载、安装、使用本产品中所提供的服务，即表明您信任该产品所有人，上海兆言对任何原因在使用本产品中提供的服务时可能对您自身或他人造成的任何形式的损失和伤害不承担任何责任。</p>
            </div>
            <div className="disclaimer-footer">www.agora.io</div>
        </div>
    )
}