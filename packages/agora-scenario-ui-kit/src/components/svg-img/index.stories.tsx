import React from 'react';
import { Meta } from '@storybook/react';
import { SvgImg } from '~components/svg-img';

import './index.css';

const meta: Meta = {
  title: 'Components/SvgImg',
  component: SvgImg,
};

type DocsProps = {
  size: number;
};

export const Docs = ({ size, fill }: DocsProps) => (
  <>
    <div style={{ marginBottom: 100 }}>
      <h1>自己手动测试玩</h1>
      <SvgImg type={'eraser'} size={200} prefixClass={'my-svg'} />
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      <div className="svg-story-div">
        <SvgImg type={'open-arrow'} size={size} />
        <p>open-arrow</p>
      </div>
      <div className="svg-story-div">
        <SvgImg type={'close-arrow'} size={size} />
        <p>close-arrow</p>
      </div>
      <div className="svg-story-div">
        <SvgImg type={'search'} size={size} />
        <p>search</p>
      </div>
      <div className="svg-story-div">
        <SvgImg type={'cloud-refresh'} size={size} />
        <p>cloud-refresh</p>
      </div>
      <div className="svg-story-div">
        <SvgImg type={'cloud-more'} size={size} />
        <p>cloud-more</p>
      </div>
      <div className="svg-story-div">
        <SvgImg type={'cloud-file-help'} size={size} />
        <p>cloud-file-help</p>
      </div>
      <div className="svg-story-div">
        <SvgImg type={'add-scene'} size={size} />
        <p>add-scene</p>
      </div>
      <div className="svg-story-div">
        <SvgImg type={'add-scene-active'} color="red" size={size} />
        <p>add-scene-active</p>
      </div>
      <div className="svg-story-div">
        <SvgImg type={'arrow'} size={size} />
        <p>arrow</p>
      </div>
      <div className="svg-story-div">
        <SvgImg type={'arrow-active'} color="red" size={size} />
        <p>arrow-active</p>
      </div>
      <div className="svg-story-div">
        <SvgImg type={'pentagram'} size={size} />
        <p>pentagram</p>
      </div>
      <div className="svg-story-div">
        <SvgImg type={'pentagram-active'} color="red" size={size} />
        <p>pentagram-active</p>
      </div>
      <div className="svg-story-div">
        <SvgImg type={'rhombus'} size={size} />
        <p>rhombus</p>
      </div>
      <div className="svg-story-div">
        <SvgImg type={'rhombus-active'} color="red" size={size} />
        <p>rhombus-active</p>
      </div>
      <div className="svg-story-div">
        <SvgImg type={'triangle'} size={size} />
        <p>triangle</p>
      </div>
      <div className="svg-story-div">
        <SvgImg type={'triangle-active'} color="red" size={size} />
        <p>triangle-active</p>
      </div>
      <div className="svg-story-div">
        <SvgImg type={'clear'} size={size} />
        <p>clear</p>
      </div>
      <div className="svg-story-div">
        <SvgImg type={'clear-active'} size={size} />
        <p>clear-active</p>
      </div>
      <div className="svg-story-div">
        <SvgImg type={'undo'} size={size} />
        <p>undo</p>
      </div>
      <div className="svg-story-div">
        <SvgImg type={'redo'} size={size} />
        <p>redo</p>
      </div>
      <div className="svg-story-div">
        <SvgImg type={'answer'} size={size} />
        <p>answer</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'vote'} size={size} />
        <p>vote</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'share-screen'} size={size} />
        <p>share-screen</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'countdown'} size={size} />
        <p>countdown</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'extension-actived'} size={size} />
        <p>extension-actived</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'excel'} size={size} />
        <p>excel</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'audio'} size={size} />
        <p>audio</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'image'} size={size} />
        <p>image</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'pdf'} size={size} />
        <p>pdf</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'txt'} size={size} />
        <p>txt</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'ppt'} size={size} />
        <p>ppt</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'unknown'} size={size} />
        <p>unknown</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'video'} size={size} />
        <p>video</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'word'} size={size} />
        <p>word</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'answer'} size={size} />
        <p>answer</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'backward'} size={size} />
        <p>backward</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'bad-signal'} size={size} />
        <p>bad-signal</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'blank-page'} size={size} />
        <p>blank-page</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'calendar'} size={size} />
        <p>calendar</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'camera'} size={size} />
        <p>camera</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'camera-off-s'} size={size} />
        <p>camera-off-s</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'camera-off'} size={size} />
        <p>camera-off</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'camera-on-s'} size={size} />
        <p>camera-on-s</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'chat'} size={size} />
        <p>chat</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'checked'} size={size} />
        <p>checked</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'circle'} size={size} />
        <p>circle</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'circle2'} size={size} />
        <p>circle2</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'close'} size={size} />
        <p>close</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'color'} size={size} />
        <p>color</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'normal-signal'} size={size} />
        <p>normal-signal</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'countdown'} size={size} />
        <p>countdown</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'delete'} size={size} />
        <p>delete</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'eraser'} size={size} />
        <p>eraser</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'exit'} size={size} />
        <p>exit</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'laser-pointer'} size={size} />
        <p>laser-pointer</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'line'} size={size} />
        <p>line</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'hands-up-student'} size={size} />
        <p>hands-up-student</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'hands-up'} size={size} />
        <p>hands-up</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'line2'} size={size} />
        <p>line2</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'microphone-on-outline'} size={size} />
        <p>microphone-on-outline</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'microphone-off'} size={size} />
        <p>microphone-off</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'microphone-on'} size={size} />
        <p>microphone-on</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'min'} size={size} />
        <p>min</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'microphone-off-outline'} size={size} />
        <p>microphone-off-outline</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'triangle-down'} size={size} />
        <p>triangle-down</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'more'} size={size} />
        <p>more</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'on-podium'} size={size} />
        <p>on-podium</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'no-discussion'} size={size} />
        <p>no-discussion</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'out'} size={size} />
        <p>out</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'pen-more'} size={size} />
        <p>pen-more</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'pen'} size={size} />
        <p>pen</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'record'} size={size} />
        <p>record</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'recording'} size={size} />
        <p>recording</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'red-caution'} size={size} />
        <p>red-caution</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'select'} size={size} />
        <p>select</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'set'} size={size} />
        <p>set</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'share-screen'} size={size} />
        <p>share-screen</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'speaker'} size={size} />
        <p>speaker</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'square'} size={size} />
        <p>square</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'square2'} size={size} />
        <p>square2</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'invite-to-podium'} size={size} />
        <p>invite-to-podium</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'star-outline'} size={size} />
        <p>star-outline</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'star'} size={size} />
        <p>star</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'no-authorized'} size={size} />
        <p>no-authorized</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'authorized'} size={size} />
        <p>authorized</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'text'} size={size} />
        <p>text</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'tools'} size={size} />
        <p>tools</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'tools2'} size={size} />
        <p>tools2</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'unknown-signal'} size={size} />
        <p>unknown-signal</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'register'} size={size} />
        <p>register</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'zoom-out'} size={size} />
        <p>zoom-out</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'zoom-in'} size={size} />
        <p>zoom-in</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'log'} size={size} />
        <p>log</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'maximize'} size={size} />
        <p>maximize</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'restore'} size={size} />
        <p>restore</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'review'} size={size} />
        <p>review</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'clicker'} size={size} />
        <p>clicker</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'cloud'} size={size} />
        <p>cloud</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'forward'} size={size} />
        <p>forward</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'hand'} size={size} />
        <p>hand</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'max'} size={size} />
        <p>max</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'whiteboard'} size={size} />
        <p>whiteboard</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'h5'} size={size} />
        <p>h5</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'placeholder-camera-broken'} size={size} />
        <p>placeholder-camera-broken</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'placeholder-camera-off'} size={size} />
        <p>placeholder-camera-off</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'placeholder-camera-disabled'} size={size} />
        <p>placeholder-camera-disabled</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'placeholder-no-ask'} size={size} />
        <p>placeholder-no-ask</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'placeholder-no-body'} size={size} />
        <p>placeholder-no-body</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'placeholder-no-file'} size={size} />
        <p>placeholder-no-file</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'placeholder-no-message'} size={size} />
        <p>placeholder-no-message</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'placeholder-no-search'} size={size} />
        <p>placeholder-no-search</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'refuse'} size={size} />
        <p>refuse</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'pen-active'} size={size} />
        <p>pen-active</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'square-active'} size={size} />
        <p>square-active</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'circle-active'} size={size} />
        <p>circle-active</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'line-active'} size={size} />
        <p>line-active</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'clicker-active'} size={size} />
        <p>clicker-active</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'cloud-active'} size={size} />
        <p>cloud-active</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'eraser-active'} size={size} />
        <p>eraser-active</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'register-active'} size={size} />
        <p>register-active</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'tools-active'} size={size} />
        <p>tools-active</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'select-active'} size={size} />
        <p>select-active</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'text-active'} size={size} />
        <p>text-active</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'hand-active'} size={size} />
        <p>hand-active</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'share-default'} size={size} />
        <p>share-default</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'share-hover'} size={size} />
        <p>share-hover</p>
      </div>

      <div className="svg-story-div">
        <SvgImg type={'placeholder-not-present'} size={size} />
        <p>placeholder-not-present</p>
      </div>
    </div>
  </>
);

Docs.args = {
  size: 20,
};

export default meta;
