/**
 * Copyright (c) 2019 Yishan Authors
 *
 * All rights reserved
 */

// import consola from 'consola';

import Router from 'next/router';
import cookie from 'js-cookie';
import { NextPageContext } from 'next';
import { OutgoingHttpHeaders } from 'http';

import { IS_PRODUCTION, IS_SERVER } from './env';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop() {}

export function setUpConsole() {
  if (!IS_SERVER && IS_PRODUCTION) {
    console.log = noop;
    console.debug = noop;
    console.info = noop;
    console.warn = noop;
    console.error = noop;
  }
}

export function sleep(delay: number) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
}

export function redirect(
  url: string,
  ctx?: NextPageContext,
  removeCookie?: boolean
): void {
  if (IS_SERVER) {
    if (!ctx || !ctx.res) {
      return;
    }
    const headers: OutgoingHttpHeaders = {
      Location: `${url}?redirect-from=${ctx.asPath}${
        removeCookie ? '&clear-token' : ''
      }`,
    };
    if (removeCookie) {
      headers['Set-Cookie'] =
        'token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    ctx.res.writeHead(302, headers);
    ctx.res.end();
  } else {
    if (removeCookie) {
      cookie.remove('token');
      localStorage.removeItem('refreshToken');
    }
    Router.replace(url);
  }
}

export function eventHandlerWarning(message: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (...args: any[]) => {
    console.warn(`回调[${message}]不能为空`, ...args);
  };
}

interface IHourMinute {
  hour: number;
  minute: number;
}

export function HourMinutes2Hour(hourMinute: IHourMinute): number {
  return hourMinute.hour + Math.round((hourMinute.minute / 60) * 1000) / 1000;
}

export function Hour2HourMinutes(hourFloat: number): IHourMinute {
  const hour = Math.trunc(hourFloat);
  const minute = Math.trunc((hourFloat - hour) * 60);
  return {
    hour,
    minute,
  };
}