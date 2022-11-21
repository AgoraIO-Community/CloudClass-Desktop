import React, { useState } from 'react';
import { Meta } from '@storybook/react';
import { Modal } from '../modal';
import { HomeAbout, Disclaimer } from '.';

const meta: Meta = {
  title: 'Components/HomeAbout',
  component: HomeAbout,
};

const HomeAboutContainer = () => {
  const [visible, setVisible] = useState<boolean>(true);
  return (
    <div>
      {visible ? (
        <Modal
          title="关于"
          style={{ width: 366 }}
          onCancel={() => {
            setVisible(false);
          }}>
          <HomeAbout />
        </Modal>
      ) : null}
    </div>
  );
};

export const Docs = () => {
  return (
    <>
      <div className="mt-4">
        <HomeAboutContainer />
      </div>
    </>
  );
};

export const DocsBackModal = () => {
  const [visible, setVisible] = useState<boolean>(true);
  return (
    <>
      {visible ? (
        <div className="mt-4">
          <Modal
            style={{ width: 560 }}
            title="免责声明"
            modalType="back"
            onCancel={() => {
              setVisible(false);
            }}>
            <Disclaimer />
          </Modal>
        </div>
      ) : null}
    </>
  );
};

export default meta;
