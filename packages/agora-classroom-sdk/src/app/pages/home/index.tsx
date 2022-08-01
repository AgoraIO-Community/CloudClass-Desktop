import { Layout, Toast, transI18n } from '~ui-kit';
import './style.css';
import { addResource } from '../../components/i18n';
import { FC, useEffect, useState, Fragment } from 'react';
import { useHomeStore } from '@/infra/hooks';
import { EduRegion, EduRoleTypeEnum } from 'agora-edu-core';
import { AgoraRteEngineConfig, AgoraRteRuntimePlatform } from 'agora-rte-sdk';
import { getBrowserLanguage, storage } from '@/infra/utils';
import dayjs from 'dayjs';
import md5 from 'js-md5';
import { useHistory } from 'react-router';
import { HomeApi } from './home-api';
import { HomeLaunchOption } from '@/app/stores/home';
import { LanguageEnum } from '@/infra/api';
import { RtmRole, RtmTokenBuilder } from 'agora-access-token';
import { v4 as uuidv4 } from 'uuid';
import { observer } from 'mobx-react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { ToastType } from '@/infra/stores/common/share-ui';
import { MessageDialog } from './message-dialog';
import { HomeSettingContainer } from './home-setting';
import { LoginForm } from './login-form';
addResource();


const REACT_APP_AGORA_APP_TOKEN_DOMAIN = process.env.REACT_APP_AGORA_APP_TOKEN_DOMAIN;
const REACT_APP_AGORA_APP_SDK_DOMAIN = process.env.REACT_APP_AGORA_APP_SDK_DOMAIN;

const REACT_APP_AGORA_APP_ID = process.env.REACT_APP_AGORA_APP_ID;
const REACT_APP_AGORA_APP_CERTIFICATE = process.env.REACT_APP_AGORA_APP_CERTIFICATE;

declare const BUILD_TIME: string;
declare const BUILD_COMMIT_ID: string;

declare global {
    interface Window {
        __launchRegion: string;
        __launchLanguage: string;
        __launchRoomName: string;
        __launchUserName: string;
        __launchRoleType: string;
        __launchRoomType: string;
        __launchCompanyId: string;
        __launchProjectId: string;
    }
}



const regionByLang = {
    zh: EduRegion.CN,
    en: EduRegion.NA,
};


export const HomePage = () => {
    const homeStore = useHomeStore();
    const history = useHistory();


    const launchConfig = homeStore.launchConfig;

    // const [language, setLanguage] = useState<string>('');
    // const [region, setRegion] = useState<string>(EduRegion.CN);
    const [duration] = useState<string>(`${+launchConfig.duration / 60 || 30}`);

    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const language = window.__launchLanguage || homeStore.language || getBrowserLanguage();
        const region = window.__launchRegion || homeStore.region || regionByLang[getBrowserLanguage()];
        homeStore.setLanguage(language as LanguageEnum);
        homeStore.setRegion(region as EduRegion);
        // setLanguage(lang);
        // setRegion(region);

        if (history.location.pathname === '/share') {
            setTimeout(() => {
                handleSubmit(
                    {
                        roleType: window.__launchRoleType,
                        roomType: window.__launchRoomType,
                        roomName: window.__launchRoomName,
                        userName: `user_${''.padEnd(6, `${Math.floor(Math.random() * 10000)}`)}`
                    }
                );
            });
        }


    }, []);

    // const handleChangeRegion = (r: string) => {
    //     const region = r as EduRegion;
    //     setRegion(region);
    //     homeStore.setRegion(region);
    // };

    // const handleChangeLanguage = (l: string) => {
    //     const language = l as LanguageEnum
    //     changeLanguage(language);
    //     setLanguage(language);
    //     homeStore.setLanguage(language);
    // };

    const [courseWareList] = useState<any[]>(storage.getCourseWareSaveList());

    let tokenDomain = '';
    let tokenDomainCollection: any = {};

    try {
        tokenDomainCollection = JSON.parse(`${REACT_APP_AGORA_APP_TOKEN_DOMAIN}`);
    } catch (e) {
        tokenDomain = `${REACT_APP_AGORA_APP_TOKEN_DOMAIN}`;
    }

    const buildTime = dayjs(+BUILD_TIME || 0).format('YYYY-MM-DD HH:mm:ss');
    const commitID = BUILD_COMMIT_ID;


    const handleSubmit = async ({ roleType, roomType: rt, roomName, userName }: { roleType: string, roomType: string, roomName: string, userName: string }) => {
        if (loading) {
            return;
        }
        const language = homeStore.language || getBrowserLanguage();
        const region = homeStore.region || regionByLang[getBrowserLanguage()];

        const userRole = parseInt(roleType);

        const roomType = parseInt(rt);

        const userUuid = `${md5(userName)}${userRole}`;

        const roomUuid = `${roomName}${roomType}`;

        try {
            setLoading(true);
            const domain = `${REACT_APP_AGORA_APP_SDK_DOMAIN}`;
            if (!tokenDomain && tokenDomainCollection) {
                switch (region) {
                    case 'CN':
                        tokenDomain = tokenDomainCollection['prod_cn'];
                        break;
                    case 'AP':
                        tokenDomain = tokenDomainCollection['prod_ap'];
                        break;
                    case 'NA':
                        tokenDomain = tokenDomainCollection['prod_na'];
                        break;
                    case 'EU':
                        tokenDomain = tokenDomainCollection['prod_eu'];
                        break;
                }
            }

            HomeApi.shared.domain = tokenDomain;

            const { token, appId } = await HomeApi.shared.loginV3(userUuid, roomUuid, userRole);

            const companyId = window.__launchCompanyId;
            const projectId = window.__launchProjectId;

            let scenes = undefined;
            let themes = undefined;

            if (companyId && projectId) {
                ({ scenes, themes } = await HomeApi.shared.getBuilderResource(companyId, projectId));
            }

            const shareUrl =
                AgoraRteEngineConfig.platform === AgoraRteRuntimePlatform.Electron ? '' :
                    `${location.origin}${location.pathname}?roomName=${roomName}&roomType=${roomType}&region=${region}&language=${language}&roleType=${EduRoleTypeEnum.student}#/share`

            console.log('## get rtm Token from demo server', token);

            const config: HomeLaunchOption = {
                appId,
                sdkDomain: domain,
                pretest: true,
                courseWareList: courseWareList.slice(0, 1),
                language: language as LanguageEnum,
                userUuid: `${userUuid}`,
                rtmToken: token,
                roomUuid: `${roomUuid}`,
                roomType: roomType,
                roomName: `${roomName}`,
                userName: userName,
                roleType: userRole,
                region: region as EduRegion,
                duration: +duration * 60,
                latencyLevel: 2,
                scenes: scenes ?? {},
                themes: themes ? { default: themes } : {},
                shareUrl
            };

            config.appId = REACT_APP_AGORA_APP_ID || config.appId;
            // this is for DEBUG PURPOSE only. please do not store certificate in client, it's not safe.
            // 此处仅为开发调试使用, token应该通过服务端生成, 请确保不要把证书保存在客户端
            if (REACT_APP_AGORA_APP_CERTIFICATE) {
                config.rtmToken = RtmTokenBuilder.buildToken(
                    config.appId,
                    REACT_APP_AGORA_APP_CERTIFICATE,
                    config.userUuid,
                    RtmRole.Rtm_User,
                    0,
                );

                console.log(`## build rtm Token ${config.rtmToken} by using RtmTokenBuilder`);
            }
            homeStore.setLaunchConfig(config);
            history.push('/launch');
        } catch (e) {
            homeStore.addToast({
                id: uuidv4(),
                desc:
                    (e as Error).message === 'Network Error'
                        ? transI18n('home.network_error')
                        : (e as Error).message,
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    }

    // const languageOptions = [
    //     { text: '中文', value: 'zh' },
    //     { text: 'English', value: 'en' },
    // ];

    // const regionOptions = [
    //     { text: 'NA', value: 'NA' },
    //     { text: 'AP', value: 'AP' },
    //     { text: 'CN', value: 'CN' },
    //     { text: 'EU', value: 'EU' },
    // ];

    return (
        <Fragment>
            <MessageDialog />
            <HomeToastContainer />
            <div className="app-home h-full">
                <nav className='absolute left-0 top-0 w-full text-white' style={{ padding: 32, zIndex: 10 }}>
                    <Layout className='justify-between items-end'>
                        <Layout className='nav-header flex items-center' >
                            <span className='product-logo' />
                            <span className='product-name'>Flexible Classroom</span>
                        </Layout>
                        <Layout>
                            {/* <div className='mr-3'>
                                <Dropdown options={regionOptions} value={region} onChange={handleChangeRegion} />
                            </div>
                            <div className='mr-3'>
                                <Dropdown options={languageOptions} value={language} onChange={handleChangeLanguage} width={68} />
                            </div> */}
                            <span className='about-btn cursor-pointer'>
                                <HomeSettingContainer />
                            </span>
                        </Layout>
                    </Layout>
                </nav>
                <div className='form-section fixed animated-form' style={{ top: 'min(max(calc( 50% - 270px ), 100px), 200px)', right: 40, padding: '36px 54px 26px' }}>
                    <LoginForm onSubmit={handleSubmit} />
                </div>
            </div>
        </Fragment>
    )
}



const HomeToastContainer: FC = observer(() => {
    const { toastList, removeToast } = useHomeStore();
    return (
        <TransitionGroup style={{ justifyContent: 'center', display: 'flex' }}>
            {toastList.map((value: ToastType, idx: number) => (
                <CSSTransition classNames="toast-animation" timeout={1000} key={`${value.id}`}>
                    <Toast
                        style={{ position: 'absolute', top: 50 * (idx + 1), zIndex: 9999 }}
                        type={value.type}
                        closeToast={() => {
                            removeToast(value.id);
                        }}>
                        {value.desc}
                    </Toast>
                </CSSTransition>
            ))}
        </TransitionGroup>
    );
});
