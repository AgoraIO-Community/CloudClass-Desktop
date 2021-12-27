import { HomeH5Page } from './h5';
import { HomePage } from '.';
import { UUAparser } from 'agora-edu-core';

export const Home = () => (UUAparser.mobileBrowser ? HomeH5Page : HomePage);
