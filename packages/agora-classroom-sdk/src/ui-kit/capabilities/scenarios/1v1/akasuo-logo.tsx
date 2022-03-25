import React from 'react';
import logo from './akasuo-logo.svg';

export default function AkasuoLogo() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 46,
        marginTop: 4,
      }}>
      <img src={logo} />
    </div>
  );
}
