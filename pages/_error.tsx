/**
 * Copyright (c) 2019 Yishan Authors
 *
 * All rights reserved
 */

import * as React from 'react';
import Head from 'next/head';
import { AnchorButton } from '@yishanzhilubp/core';
import { useRouter } from 'next/router';
import { useUserContext } from '@/src/scopes/global/userContext';

/* eslint-disable react/no-danger */

const styles: { [k: string]: React.CSSProperties } = {
  error: {
    color: '#646464',
    background: '#fff',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, Roboto, "Segoe UI", "Fira Sans", Avenir, "Helvetica Neue", "Lucida Grande", sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '30vh',
  },
};

function TaiError({ code = 500, message = '出错了', url = '' }) {
  const { asPath } = useRouter();
  if (code === 404) {
    message = url ? `请求的 URL ${url} 不存在` : `请求的页面 ${asPath} 不存在`;
  }
  const {
    state: { isLogin },
  } = useUserContext();
  return (
    <div style={styles.error}>
      <Head>
        <title>{code || '出错了'} - 移山</title>
      </Head>
      <div>
        {code ? <h1 style={{ fontSize: 40, margin: 0 }}>{code}</h1> : null}
        <p
          style={{
            fontSize: 18,
            margin: '23px 0',
            maxWidth: 300,
            lineHeight: '22px',
          }}
        >
          {message.toString()}
        </p>
        <AnchorButton
          href={isLogin ? '/workspace/dashboard' : '/'}
          intent="primary"
        >
          返回首页
        </AnchorButton>
        {/* {code === 403 && (
          <Link
            href={{ pathname: '/login', query: { 'redirect-from': asPath } }}
            passHref
          >
            <AnchorButton style={{ marginLeft: 20 }}>登录访问</AnchorButton>
          </Link>
        )} */}
      </div>
      <img
        style={{ width: 150, height: 150, marginLeft: 100 }}
        src="/static/layout/logo.png"
        alt="page error"
      />
    </div>
  );
}

TaiError.getInitialProps = ({ res, err }) => {
  let code: number;
  if (res) {
    code = res.statusCode;
  } else if (err) {
    code = err.statusCode;
  } else {
    code = 404;
  }
  return { code };
};

export default TaiError;
