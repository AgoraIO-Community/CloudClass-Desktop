import React, { useState, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react';
import { reaction } from 'mobx';
import dayjs from 'dayjs';
import { usePluginStore } from './hooks';
import addSvg from './add.svg';
import reduceSvg from './reduce.svg';
import { Button, Col, Row, Table, TableHeader, transI18n } from '~ui-kit';
import './index.css';

const App = observer(() => (
  <>
    <Content />
    <AnswerBtns />
  </>
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
    isController,
    myAnswer,
  } = pluginStore;

  return (
    <>
      {isShowResultDetail && <ResultDetail />}
      {isShowSelectionSection && (
        <div className="answer-options">
          {answerList.map((value: string, index: number) => (
            <span
              key={index}
              className={`answer-option ${optionPermissions} ${
                isSelectedAnswer(value) ? 'answer-checked' : ''
              }`}
              onClick={(_) => handleOptionClick(value)}>
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
          {!isController && (
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
  const [list, setList] = useState<any>([]);
  const [nextId, setNextId] = useState(0);

  useEffect(() => {
    fetchList();
    reaction(
      () => pluginStore.context.roomProperties,
      () => {
        if (pluginStore.context.roomProperties.extra?.answerState) {
          fetchList();
        }
      },
    );
  }, []);

  const formatTime = useCallback((startTime, endTime) => {
    const duration = endTime - startTime;
    const durationStr = dayjs.duration(duration, 'ms').format('HH:mm:ss');
    return durationStr;
  }, []);

  const extractPerson = React.useCallback((arr) => {
    var tempMap = new Map();
    arr.forEach((value: any) => {
      tempMap.set(value.ownerUserUuid, value);
    });
    return [...tempMap.values()];
  }, []);

  const fetchList = useCallback(async () => {
    if (pluginStore.isController) {
      const res = await pluginStore.getAnswerList(nextId, 50);
      const resultData = res.data;

      setList((pre: any) => extractPerson([...pre, ...resultData.list]));
      setNextId(resultData.nextId);
    }
  }, [nextId]);

  return (
    <div className="answer-userlist">
      <Table className="answer-table">
        <TableHeader>
          <Col key="student-name" style={{ justifyContent: 'center' }}>
            {transI18n('answer.student-name')}
          </Col>
          <Col key="answer-time" style={{ justifyContent: 'center' }}>
            {transI18n('answer.answer-time')}
          </Col>
          <Col key="selected-answer" style={{ justifyContent: 'center' }}>
            {transI18n('answer.selected-answer')}
          </Col>
        </TableHeader>
        <Table className="table-container">
          {list?.map((student: any) => (
            <Row className={'border-bottom-width-1'} key={student.ownerUserUuid}>
              {['ownerUserName', 'lastCommitTime', 'selectedItems'].map(
                (col: string, idx: number) => (
                  <Col
                    key={idx}
                    style={{
                      justifyContent: 'center',
                      color:
                        col === 'selectedItems'
                          ? student.isCorrect
                            ? '#3AB449'
                            : '#F04C36'
                          : '#191919',
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

export default App;
