import { useStore } from '@/infra/hooks/ui-store';
import { OnPodiumStateEnum } from '@/infra/stores/common/type';
import { EduRoleTypeEnum } from 'agora-edu-core';
import cls from 'classnames';
import { observer } from 'mobx-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Col, Row, Search, SvgIconEnum, SvgImg, Table, TableHeader, transI18n } from '~ui-kit';
import './invite-table.css';

interface InviteTableProps {
  onSearchChange?: (keyword: string) => void;
}
const getRoleString = (role: EduRoleTypeEnum): string => {
  switch (role) {
    case EduRoleTypeEnum.assistant:
      return transI18n('marketing.table.role_assistant');
    case EduRoleTypeEnum.student:
      return transI18n('marketing.table.role_student');
    case EduRoleTypeEnum.teacher:
      return transI18n('marketing.table.role_teacher');
    case EduRoleTypeEnum.invisible:
      return transI18n('marketing.table.role_audience');
    default:
      return '';
  }
};
const getOnPodiumStateString = (state: OnPodiumStateEnum): string => {
  switch (state) {
    case OnPodiumStateEnum.onPodiuming:
      return transI18n('invite.clear_podium');
    case OnPodiumStateEnum.waveArming:
      return transI18n('invite.accept_podium');
    case OnPodiumStateEnum.inviteding:
      return transI18n('invite.inviting_podium');
    case OnPodiumStateEnum.idleing:
      return transI18n('invite.invite_podium');
    default:
      return '';
  }
};
export const InviteTable: React.FC<InviteTableProps> = observer(() => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const { handUpUIStore } = useStore();
  const {
    userList,
    fetchUsersList,
    resetStudentList,
    invitePodium,
    inviteListMaxLimit,
    acceptedListMaxLimit,
  } = handUpUIStore;
  useEffect(() => {
    fetchUsersList({ nextId: null }, true);
    return () => {
      resetStudentList();
    };
  }, []);
  const onKeywordChange = (v: string) => {
    setSearchKeyword(v);
  };
  const dataSource = useMemo(() => {
    if (searchKeyword) {
      return userList.filter((v) => v.name.includes(searchKeyword));
    } else {
      return userList;
    }
  }, [userList, searchKeyword]);

  return (
    <div className="invite-table-wrap">
      {/* search input */}
      <div className="search">
        <Search
          value={searchKeyword}
          onSearch={onKeywordChange}
          prefix={<SvgImg type={SvgIconEnum.SEARCH} />}
          inputPrefixWidth={20}
          placeholder={transI18n('marketing.search')}
        />
      </div>
      {/* table list */}
      <Table className="table">
        <TableHeader>
          <Col>{transI18n('marketing.table.name')}</Col>
          <Col>{transI18n('marketing.table.role')}</Col>
          <Col></Col>
        </TableHeader>
        <Table className="table-container">
          {dataSource.length
            ? dataSource.map((item) => {
                const { name, role, uid, onPodiumState } = item;
                return (
                  <Row height={10} border={1} key={uid}>
                    <Col>
                      <div className="table-user-name" title={name}>
                        {name}
                      </div>
                    </Col>
                    <Col>{getRoleString(role)}</Col>
                    <Col
                      className={cls({
                        'podium-btn': 1,
                        ['podium-state-' + onPodiumState]: 1,
                        ['podium-max-limit']:
                          onPodiumState === OnPodiumStateEnum.idleing &&
                          (inviteListMaxLimit || acceptedListMaxLimit),
                      })}
                      onClick={() => invitePodium(item)}>
                      {getOnPodiumStateString(onPodiumState)}
                    </Col>
                  </Row>
                );
              })
            : null}
        </Table>
      </Table>
    </div>
  );
});
