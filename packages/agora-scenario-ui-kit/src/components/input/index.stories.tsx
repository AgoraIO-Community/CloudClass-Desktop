import React, { useState } from 'react';
import { Meta } from '@storybook/react';
import { Input, Search } from '../input';
import { Button } from '../button';
import { SvgIcon, SvgIconEnum, SvgImg } from '../svg-img';

const meta: Meta = {
  title: 'Components/Input',
  component: Input,
};

export const Docs = () => {
  const [input0, setInput0] = useState('');
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [input3, setInput3] = useState('');
  const [input4, setInput4] = useState('');
  const [input5, setInput5] = useState(1);
  return (
    <>
      <h1>Input 组件</h1>
      <div className="mt-4">
        <Input
          type="number"
          value={input5}
          onChange={(e) => {
            let num = +e.target.value;
            if (num > 32) {
              num = 32;
            }
            if (num <= 1) {
              num = 1;
            }
            setInput5(num);
          }}
          min={1}
          max={32}
        />
      </div>
      <div className="mt-4">
        <Input
          value={input0}
          onChange={(e) => {
            setInput0(e.target.value);
          }}
          rule={/^[a-zA-Z0-9]{1,10}$/}
          errorMsg={'你输错了'}
          placeholder="这个是校验只能输入英文数字的input"
        />
      </div>
      <div className="mt-4">
        <Input
          placeholder="前置是纯文本的placeholder"
          prefix={<span style={{ color: '#333' }}>纯文本</span>}
          value={input1}
          onChange={(e) => {
            setInput1(e.target.value);
          }}
        />
      </div>
      <div className="mt-4">
        <Input
          placeholder="前置是icon的placeholder"
          prefix={<SvgImg type={SvgIconEnum.PEN} />}
          value={input2}
          onChange={(e) => {
            setInput2(e.target.value);
          }}
        />
      </div>
      <div className="mt-4">
        <Input
          placeholder="这个是有后置的placeholder"
          value={input3}
          onChange={(e) => {
            setInput3(e.target.value);
          }}
          suffix={<Button>Button</Button>}
        />
      </div>
      <h1 className="mt-4">Search 组件</h1>
      <div className="mt-4">
        <Search
          onSearch={(value) => console.log(value)}
          suffix={<SvgIcon type={SvgIconEnum.SEARCH} />}
          placeholder={'search的placeholder'}
        />
      </div>
    </>
  );
};

export default meta;
