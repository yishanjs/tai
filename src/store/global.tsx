/**
 * Copyright (c) 2019 Yishan Authors
 *
 * All rights reserved
 */

import * as React from 'react';
import { NextPage } from 'next';
import NextError from 'next/error';
import { useStaticRendering, useLocalStore } from 'mobx-react-lite';
import nextCookie from 'next-cookies';

import { IUserProfile, IWorkProfile } from '@/src/types/schemas';
import { TaiLayout } from '@/src/layout';
import { IS_SERVER } from '@/src/utils';
import { redirect } from '@/src/utils/funcs';
import { axios } from '@/src/api';
import { ErrorBoundary } from '@/src/components/errors/error-handling';

useStaticRendering(IS_SERVER);

export type ITheme = 'light' | 'dark';

export type IGlobalState = {
  user: IUserProfile;
  theme: ITheme;
  work?: IWorkProfile;
};

export type IGlobalStore = {
  toggleTheme: () => void;
} & IGlobalState;

const defaultState: IGlobalState = {
  user: null,
  theme: 'light',
  work: {
    goals: [],
    missions: [],
    hours: 0,
  },
};

export const initializeStore = (initialState = defaultState) => {
  return useLocalStore(state => {
    return {
      user: state.user || undefined,
      theme: state.theme || 'light',
      work: state.work || undefined,
      toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
      },
    };
  }, initialState);
};

let windowStore: IGlobalStore;
const getOrInitializeWindowStore = initialState => {
  // Always make a new store if server,
  // otherwise state is shared between requests
  if (IS_SERVER) {
    return initializeStore(initialState);
  }

  // Create store if unavailable on the client and set it on the window object
  if (!windowStore) {
    windowStore = initializeStore(initialState);
  }
  return windowStore;
};

// context and its provider for global store
const storeContext = React.createContext<IGlobalStore | null>(null);
const StoreProvider: React.FC<{ initialState: IGlobalState }> = ({
  children,
  initialState,
}) => {
  const store = getOrInitializeWindowStore(initialState);
  return (
    <storeContext.Provider value={store}>{children}</storeContext.Provider>
  );
};

async function getInitialState(token: string): Promise<IGlobalState> {
  const res = await Promise.all([
    axios.get('/users/me', {
      headers: {
        Authorization: token,
      },
    }),
    axios.get('/workspace/overview', {
      headers: {
        Authorization: token,
      },
    }),
  ]);
  return {
    user: res[0].data,
    work: res[1].data,
    theme: 'light',
  };
}

// hoc for pages want global store context
export const withGlobalState = PageComponent => {
  const WithGlobalState: NextPage<{ initialState: IGlobalState }> = ({
    initialState,
    ...props
  }) => {
    return (
      <StoreProvider initialState={initialState}>
        <ErrorBoundary fallback={<NextError statusCode={500} />}>
          <TaiLayout>
            <PageComponent {...props} />
          </TaiLayout>
        </ErrorBoundary>
      </StoreProvider>
    );
  };

  WithGlobalState.getInitialProps = async context => {
    try {
      const { everestToken: token } = nextCookie(context);
      if (!token) {
        // 没有 token，去login
        redirect('/login', context);
      }
      let initialState = defaultState;
      if (IS_SERVER || !windowStore) {
        initialState = await getInitialState(token);
      }
      const contextWithStore = {
        ...context,
        initialState,
      };
      // Run getInitialProps from high order PageComponent
      const pageProps =
        typeof PageComponent.getInitialProps === 'function'
          ? await PageComponent.getInitialProps(contextWithStore)
          : {};

      // Pass props to PageComponent
      return {
        ...pageProps,
        initialState,
      };
    } catch (error) {
      console.error(`withGlobalState.getInitialProps | error: ${error}`);
      // token 错误，删除通过 redirect 的 removeCookie 删除 token
      redirect('/login', context, true);
      return { initialState: defaultState };
    }
  };

  return WithGlobalState;
};

// hook for components want use global store,
// the component must inside a withGlobalState() hoc
export const useGlobalStore = () => {
  const store = React.useContext(storeContext);
  if (!store) {
    // this is especially useful in TypeScript
    // so you don't need to be checking for null all the time
    throw new Error('useStore must be used within a StoreProvider.');
  }
  return store;
};
