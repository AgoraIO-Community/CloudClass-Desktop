import React from 'react'
import { useHistory } from 'react-router-dom';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { makeContainer } from '../../../agora-scenario-ui-kit/lib';

export const useEffectOnce = (effect: any) => {
  useEffect(effect, [])
}