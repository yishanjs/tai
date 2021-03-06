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
import querystring, { ParsedUrlQuery } from 'querystring';

import { IS_PRODUCTION, IS_SERVER, IS_BROWSER } from './constants';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop() {}

export function setUpConsole() {
  if (IS_PRODUCTION) {
    if (IS_BROWSER) {
      console.log = noop;
      // console.info = noop;
      // console.warn = noop;
      // console.error = noop;
    }
    console.debug = noop;
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
  removeCookie = false,
  withRedirectFrom = false,
  query: ParsedUrlQuery = {}
): void {
  function parseUrl(asPath: string) {
    if (withRedirectFrom) query['redirect-from'] = asPath;
    if (removeCookie) {
      query['clear-token'] = '';
    }
    const queryStr = querystring.stringify(query);
    url = queryStr === '' ? url : `${url}?${queryStr}`;
    return url;
  }
  if (IS_SERVER) {
    console.debug('redirect with server');
    if (!ctx || !ctx.res) {
      return;
    }
    const headers: OutgoingHttpHeaders = {
      Location: parseUrl(ctx.asPath),
    };
    if (removeCookie) {
      headers['Set-Cookie'] =
        'token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    ctx.res.writeHead(302, headers);
    ctx.res.end();
  } else {
    console.debug('redirect with browser');
    if (removeCookie) {
      cookie.remove('token');
      localStorage.removeItem('refreshToken');
    }
    Router.push(parseUrl(Router.asPath));
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

// getDateDiffFromNow 获取从当前到目标时间的差值的口语化描述
const minute = 1000 * 60;
const hour = minute * 60;
const day = hour * 24;
const month = day * 30;
export function getDateDiffFromNow(dateTimeStamp: string) {
  const now = new Date().getTime();
  const old = new Date(dateTimeStamp);
  const diffValue = now - old.getTime();
  if (diffValue < 0) {
    console.error('negative time', { old, now });
    return `${dateTimeStamp}`;
  }
  const monthC = diffValue / month;
  const weekC = diffValue / (7 * day);
  const dayC = diffValue / day;
  const hourC = diffValue / hour;
  const minC = diffValue / minute;
  let result: string;
  if (monthC >= 12) {
    result = `${old.getFullYear()}-${old.getMonth() + 1}-${old.getDate()}`;
  } else if (monthC >= 1) {
    result = `${Math.floor(monthC).toString()}个月前`;
  } else if (weekC >= 1) {
    result = `${Math.floor(weekC).toString()}周前`;
  } else if (dayC >= 1) {
    result = `${Math.floor(dayC).toString()}天前`;
  } else if (hourC >= 1) {
    result = `${Math.floor(hourC).toString()}小时前`;
  } else if (minC >= 1) {
    result = `${Math.floor(minC).toString()}分钟前`;
  } else result = '刚刚';
  return result;
}

export function formatMinutes(mintues: number) {
  const hours = Math.floor(mintues / 60);
  return `${hours} : ${(mintues % 60).toString().padStart(2, '0')}`;
}

export function formatDate(dateTimeStamp: string) {
  const date = new Date(dateTimeStamp);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}
