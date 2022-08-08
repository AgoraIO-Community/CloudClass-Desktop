import React, { useState, useEffect, useCallback, FC, useContext } from 'react';
import { observer } from 'mobx-react';
import dayjs from 'dayjs';
import { usePluginStore } from './hooks';
import addSvg from './add.svg';
import reduceSvg from './reduce.svg';
import { Button, Col, Row, Table, TableHeader, themeContext, transI18n } from '~ui-kit';
import './index.css';
import awardSvg from './award.svg';

const App = observer(() => (
  <div className="h-full w-full overflow-hidden" style={{ padding: '21px 14px' }}>
    <Content />
    <AnswerBtns />
  </div>
));

const Content = observer(() => {
  const pluginStore = usePluginStore();
  const {
    isShowSelectionSection,
    isShowResultSection,
    answerList,
    isSelectedAnswer,
    handleOptionClick,
    answeredNumber,
    currentAnalysis,
    currentAnswer,
    optionPermissions,
    isShowResultDetail,
    isTeacherType,
    myAnswer,
  } = pluginStore;

  const btnDisabled = optionPermissions.includes('not-allowed');

  return (
    <>
      {isShowResultDetail && <ResultDetail />}
      {isShowSelectionSection && (
        <div className="answer-options">
          {answerList.map((value: string, index: number) => (
            <span
              key={index}
              className={`answer-option ${optionPermissions} ${isSelectedAnswer(value) ? 'answer-checked' : ''
                }`}
              onClick={!btnDisabled ? (_) => handleOptionClick(value) : () => { }}>
              {value}
            </span>
          ))}
        </div>
      )}
      {isShowResultSection && (
        <div className="answer-result-info">
          <div>
            <span>{transI18n('widget_selector.number-answered')}：</span>
            {answeredNumber}
          </div>
          <div>
            <span>{transI18n('widget_selector.acc')}：</span>
            {currentAnalysis}
          </div>
          <div>
            <span>{transI18n('widget_selector.right-key')}：</span>
            {currentAnswer}
          </div>
          {!isTeacherType && (
            <div>
              <span>{transI18n('widget_selector.my-answer')}：</span>
              {myAnswer}
            </div>
          )}
        </div>
      )}
    </>
  );
});

const ResultDetail = observer(() => {
  const pluginStore = usePluginStore();
  const { safe, error, textLevel1 } = useContext(themeContext);
  useEffect(() => {
    pluginStore.setList([]);
    if (pluginStore.isTeacherType) {
      pluginStore.fetchList();
    }
  }, []);

  const formatTime = useCallback((startTime: number, endTime: number) => {
    const duration = endTime - startTime;
    const durationStr = dayjs.duration(duration, 'ms').format('HH:mm:ss');
    return durationStr;
  }, []);

  return (
    <div className="answer-userlist">
      <Table className="answer-table">
        <TableHeader>
          <Col key="student-name" style={{ justifyContent: 'center' }}>
            {transI18n('widget_selector.student-name')}
          </Col>
          <Col key="answer-time" style={{ justifyContent: 'center' }}>
            {transI18n('widget_selector.answer-time')}
          </Col>
          <Col key="selected-answer" style={{ justifyContent: 'center' }}>
            {transI18n('widget_selector.selected-answer')}
          </Col>
        </TableHeader>
        <Table className="table-container">
          {pluginStore.rslist.map((student: any) => (
            <Row className={'border-bottom-width-1'} key={student.ownerUserUuid}>
              {['ownerUserName', 'lastCommitTime', 'selectedItems'].map(
                (col: string, idx: number) => (
                  <Col
                    key={idx}
                    style={{
                      justifyContent: 'center',
                      color:
                        col === 'selectedItems' ? (student.isCorrect ? safe : error) : textLevel1,
                    }}>
                    {
                      <span
                        title={student[col]}
                        style={{
                          paddingLeft: 0,
                        }}>
                        {col === 'lastCommitTime'
                          ? formatTime(pluginStore.startTime, student[col])
                          : student[col].toString()}
                      </span>
                    }
                  </Col>
                ),
              )}
            </Row>
          ))}
        </Table>
      </Table>
    </div>
  );
});

const AnswerBtns = observer(() => {
  const pluginStore = usePluginStore();
  const { isInitinalSection } = pluginStore;

  return (
    <div className="answer-btns-container">
      {isInitinalSection && (
        <div className="answer-btn-container">
          <span
            className={pluginStore.addBtnCls}
            onClick={() => {
              pluginStore.addOption();
            }}
            style={{
              backgroundImage: `url(${addSvg})`,
            }}></span>
          <Button
            type="primary"
            className="btn-rewrite-disabled vote-btn-launch"
            disabled={pluginStore.submitDisabled}
            onClick={pluginStore.handleStart}>
            {transI18n('widget_selector.start')}
          </Button>
          <span
            className={pluginStore.reduceBtnCls}
            onClick={() => {
              pluginStore.reduceOption();
            }}
            style={{
              backgroundImage: `url(${reduceSvg})`,
            }}></span>
        </div>
      )}
      {pluginStore.answerState === 1 && pluginStore.isController && (
        <Button type="primary" onClick={pluginStore.handleStop}>
          {transI18n('widget_selector.over')}
        </Button>
      )}
      {pluginStore.isShowAnswerBtn && (
        <Button
          type="primary"
          className="btn-rewrite-disabled"
          disabled={!pluginStore.selectedAnswers.length}
          onClick={pluginStore.handleSubmitAnswer}>
          {pluginStore.isAnswered && !pluginStore.localOptionPermission
            ? transI18n('widget_selector.change')
            : transI18n('widget_selector.submit')}
        </Button>
      )}
    </div>
  );
});

const AwardButton: FC<{ onAward: (type: 'winner' | 'all') => void; children: React.ReactNode }> = ({
  children,
  onAward,
}) => {
  const [listVisible, setListVisible] = useState(false);

  return (
    <div className="award-wrap">
      <div className={'award-list' + (listVisible ? '' : ' hidden')}>
        <ul>
          <li
            onClick={() => {
              setListVisible(false);
              onAward('winner');
            }}>
            {transI18n('widget_selector.award_winner')}
          </li>
          <li
            onClick={() => {
              setListVisible(false);
              onAward('all');
            }}>
            {transI18n('widget_selector.award_all')}
          </li>
        </ul>
      </div>
      <Button
        onClick={() => {
          setListVisible(!listVisible);
        }}>
        <div className="flex justify-center">
          <span
            style={{
              display: 'inline-block',
              height: 24,
              width: 24,
              backgroundImage: `url(${awardSvg})`,
            }}
          />
          {children}
        </div>
      </Button>
    </div>
  );
};

export default App;
