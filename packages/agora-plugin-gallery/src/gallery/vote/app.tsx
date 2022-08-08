import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';
import React from 'react';
import { Button, CheckBox, Input, transI18n } from '~ui-kit';
import addSvg from './add.svg';
import { usePluginStore } from './hooks';
import './index.css';
import reduceSvg from './reduce.svg';

const MAX_LENGTH = 50;

const App = () => (
  <div className="w-full" style={{ padding: '21px 14px' }}>
    <Title />
    <Content />
    <VoteBtns />
  </div>
);

const Title = observer(() => {
  const pluginStore = usePluginStore();
  return (
    <>
      {pluginStore.isInitinalStage ? (
        <>
          <textarea
            value={pluginStore.title}
            className="vote-title"
            placeholder={transI18n('widget_polling.input-tip')}
            maxLength={MAX_LENGTH}
            onChange={(e: any) => {
              pluginStore.setTitle(e.target.value);
            }}
          />
          <span className="vote-limit">
            {pluginStore.title?.length || 0}/{MAX_LENGTH}
          </span>
          <div className="vote-type">
            <label htmlFor="singal">
              <input
                id="singal"
                name="vote-type"
                type="radio"
                value="radio"
                checked={pluginStore.type === 'radio'}
                onChange={(_) => pluginStore.setType('radio')}
              />
              {transI18n('widget_polling.single-sel')}
            </label>
            <label htmlFor="multi">
              <input
                id="multi"
                name="vote-type"
                type="radio"
                value="checkbox"
                checked={pluginStore.type === 'checkbox'}
                onChange={(_) => pluginStore.setType('checkbox')}
              />
              {transI18n('widget_polling.mul-sel')}
            </label>
          </div>
        </>
      ) : (
        <div className="vote-question break-all">{pluginStore.title} </div>
      )}
    </>
  );
});

const Content = observer(() => {
  const pluginStore = usePluginStore();
  return (
    <div>
      {pluginStore.isInitinalStage &&
        pluginStore.options.map((option: string, idx: number) => (
          <div key={idx} className="vote-item-container">
            <Input
              className="vote-item"
              maxLength={MAX_LENGTH}
              value={option}
              onChange={(e) => pluginStore.changeOptions(idx, e.target.value)}
              placeholder={transI18n('widget_polling.item-tip')}
              prefix={
                <span
                  className="text-level2"
                  style={{
                    fontSize: '14px',
                  }}>
                  {idx + 1}.
                </span>
              }
            />
          </div>
        ))}
      {pluginStore.isShowResultSection && <ResultSection />}
      {pluginStore.isShowVote && <SelectionSection />}
    </div>
  );
});

const VoteBtns = observer(() => {
  const pluginStore = usePluginStore();
  const cursorRef = React.useRef<boolean>(false);

  const handleSubmitVote = React.useCallback(() => {
    if (!cursorRef.current) {
      pluginStore.handleSubmitVote().catch(() => {
        cursorRef.current = false;
      });
      cursorRef.current = true;
    }
  }, []);

  return (
    <div className="vote-btns-container">
      {pluginStore.isInitinalStage && (
        <div className="vote-btn-container">
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
            onClick={pluginStore.handleStartVote}>
            {transI18n('widget_polling.start')}
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
      {pluginStore.stagePanel === 1 && pluginStore.isController && (
        <Button type="primary" onClick={pluginStore.handleStopVote}>
          {transI18n('widget_polling.over')}
        </Button>
      )}
      {pluginStore.isShowVoteBtn && (
        <Button
          type="primary"
          className="btn-rewrite-disabled"
          disabled={!pluginStore.selectedOptions.length || pluginStore.visibleVote}
          onClick={handleSubmitVote}>
          {transI18n('widget_polling.submit')}
        </Button>
      )}
    </div>
  );
});

const ResultSection = observer(() => {
  const pluginStore = usePluginStore();

  return (
    <div className="result-section">
      {!isEmpty(pluginStore.pollingResult) &&
        pluginStore.options.map((value: string, index: number) => (
          <div key={value} className="result-item">
            <span className="result-cursor">{index + 1}.</span>
            <div className="result-info-container">
              <div className="result-info">
                <span className="vote-text break-all" title={value}>
                  {value}
                </span>{' '}
                <span className="vote-text-percentage">
                  ({pluginStore.pollingResult[index].num}){' '}
                  {Math.floor(pluginStore.pollingResult[index].percentage * 100)}%
                </span>
              </div>
              <div className="vote-percentage">
                <div
                  className="vote-percentage-inner"
                  style={{ width: `${pluginStore.pollingResult[index].percentage * 100}%` }}></div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
});

const SelectionSection = observer(() => {
  const pluginStore = usePluginStore();
  const { type, options, selectedOptions, visibleVote, hanldeSelectedOptions } = pluginStore;

  return (
    <>
      {options.map((option: string) => (
        <label className="selection-item-container" htmlFor={option}>
          <div className="selection-check">
            {type === 'radio' ? (
              <input
                type="radio"
                id={option}
                name="vote-selection"
                onChange={hanldeSelectedOptions}
                value={option}
                disabled={visibleVote}
                checked={selectedOptions.includes(option)}
              />
            ) : (
              <CheckBox
                id={option}
                onChange={hanldeSelectedOptions}
                value={option}
                disabled={visibleVote}
                checked={selectedOptions.includes(option)}
              />
            )}
          </div>
          <div className="selection-text break-all" title={option}>
            {option}
          </div>
        </label>
      ))}
    </>
  );
});

export default App;
