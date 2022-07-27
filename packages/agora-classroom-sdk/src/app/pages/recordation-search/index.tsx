import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Button,
  changeLanguage,
  Header,
  Input,
  Layout,
  Placeholder,
  SvgIconEnum,
  SvgImg,
  transI18n,
} from '~ui-kit';
import dayjs from 'dayjs';
import { HomeApi } from '../home/home-api';
import './style.css';

export const RecordationSearchPage = () => {
  const [roomId, setRoomId] = React.useState<string>('');
  const [recordations, setRecordations] = React.useState([]);
  const [_, forceUpdate] = React.useState<any>(null);
  const { p } = useParams<{ p: string }>();

  React.useEffect(() => {
    const asciip = JSON.parse(Buffer.from(p, 'base64').toString('ascii')) as any;
    changeLanguage(asciip.language);

    const REACT_APP_AGORA_APP_TOKEN_DOMAIN = process.env.REACT_APP_AGORA_APP_TOKEN_DOMAIN;
    let tokenDomain = '';
    let tokenDomainCollection: any = {};
    try {
      tokenDomainCollection = JSON.parse(`${REACT_APP_AGORA_APP_TOKEN_DOMAIN}`);
    } catch (e) {
      tokenDomain = `${REACT_APP_AGORA_APP_TOKEN_DOMAIN}`;
    }

    if (!tokenDomain && tokenDomainCollection) {
      switch (asciip.region) {
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

    forceUpdate({});
  }, []);

  const handleRecordationSearch = React.useCallback(async () => {
    //fetch api
    const recordations = await HomeApi.shared.getRecordations(roomId);
    setRecordations(recordations.list);
  }, [roomId]);

  const renderRecordationList = React.useMemo(() => {
    if (!recordations?.length) return <Placeholder placeholderType="noFile" />;
    return (
      recordations?.length &&
      recordations.map((recordation: any) => (
        <div className="recordation-list-item flex items-center" key={recordation.endTime}>
          <div className="flex-1">
            <p>{recordation.roomUuid}</p>
            <p>{`${dayjs(recordation.startTime).format('YYYY/MM/DD hh:mm')} ~ ${dayjs(
              recordation.endTime,
            ).format('YYYY/MM/DD hh:mm')}`}</p>
          </div>
          <a rel="noreferrer" href={`${recordation.recordDetails[0]?.url}`} target="_blank">
            <Button type="primary" size="sm" className="primary-ghost">
              {transI18n('home.replay')}
            </Button>
          </a>
        </div>
      ))
    );
  }, [recordations]);
  return (
    <section className="flex h-full">
      <Header className="home-page-header">
        <div className="header-left">
          <div className="header-left-logo"></div>
          <div className="header-left-title">{transI18n('home.header-left-title')}</div>
        </div>
        <div className="header-right">
          <Link className="header-right-item" to={'/'}>
            <SvgImg style={{ color: '#3f5c8f', display: 'inline-block' }} type={SvgIconEnum.EXIT} size={24} />
            {transI18n('nav.back')}
          </Link>
        </div>
      </Header>
      <section className="flex flex-1 justify-center items-center">
        <Layout className="recordation-search-container flex-col">
          <div className="recordation-search-form flex items-center">
            <span className="recordation-label" title={transI18n('home.roomName')}>
              {transI18n('home.roomName')}：
            </span>
            <Input
              type="text"
              value={roomId}
              onChange={(evt) => setRoomId(evt.currentTarget.value)}
              placeholder={transI18n('home.roomId_placeholder')}
            />
            <Button
              id="btn_join"
              type="primary"
              size="sm"
              onClick={handleRecordationSearch}
              disabled={!(!!roomId && /^[a-zA-Z0-9]{6,20}$/.test(roomId))}>
              {transI18n('home.search')}
            </Button>
          </div>
          <p className="recordation-tips">* {transI18n('home.recordation-tip')}</p>
          <div className="recordation-list flex flex-1 flex-col">{renderRecordationList}</div>
        </Layout>
      </section>
    </section>
  );
};
