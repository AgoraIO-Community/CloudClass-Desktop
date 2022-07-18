import { Helmet } from 'react-helmet';

export const PageHeader = () => {
  return (
    <Helmet>
      <meta
        name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
      />
      <meta content="yes" name="apple-mobile-web-app-capable" />
      <meta content="black" name="apple-mobile-web-app-status-bar-style" />
      <meta content="telephone=no" name="format-detection" />
    </Helmet>
  );
};
