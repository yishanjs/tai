/**
 * Copyright (c) 2019 Yishan Authors
 *
 * All rights reserved
 */

import React from 'react';
import { Dialog } from '@yishanzhilubp/core';

import { noop } from '@/src/utils/funcs';

import { NewMissionForm, NewGoalForm } from './components/topBarNewDialogs';

/**
 * User Context is used to store user info in global
 * if user is not login, user will all be blank value
 */
interface ITopBarContextState {
  newGoalOpen: boolean;
  newMissionOpen: boolean;
  startNow: boolean;
  goalID?: number;
}

type ITopBarContextAction =
  | { type: 'SetNewGoalDialog'; isOpen: boolean; startNow?: boolean }
  | {
      type: 'SetNewMissionDialog';
      isOpen: boolean;
      startNow?: boolean;
      goalID?: number;
    };

const defaultState: ITopBarContextState = {
  newGoalOpen: false,
  newMissionOpen: false,
  startNow: true,
  goalID: 0,
};

const userContextReducer = (
  state: ITopBarContextState,
  action: ITopBarContextAction
): ITopBarContextState => {
  switch (action.type) {
    case 'SetNewGoalDialog':
      return {
        ...state,
        startNow: action.startNow,
        newGoalOpen: action.isOpen,
      };
    case 'SetNewMissionDialog':
      return {
        ...state,
        startNow: action.startNow,
        newMissionOpen: action.isOpen,
        goalID: action.isOpen ? action.goalID : 0,
      };
    default:
      return defaultState;
  }
};

const TopBarContext = React.createContext<{
  state: ITopBarContextState;
  dispatch: React.Dispatch<ITopBarContextAction>;
}>({ state: defaultState, dispatch: noop });

export const useTopBarContext = () => React.useContext(TopBarContext);

/**
 * TopBarContextPorvider
 * uses workProfile, so must inside WorkProfileProvider
 */
export const TopBarContextPorvider: React.FC = ({ children }) => {
  const [state, dispatch] = React.useReducer(userContextReducer, defaultState);
  return (
    <TopBarContext.Provider value={{ state, dispatch }}>
      <Dialog
        title="🎯 设立目标"
        isOpen={state.newGoalOpen}
        onClose={() =>
          dispatch({ type: 'SetNewGoalDialog', isOpen: false, startNow: true })
        }
      >
        <NewGoalForm />
      </Dialog>
      <Dialog
        title="📌 创建任务"
        isOpen={state.newMissionOpen}
        onClose={() =>
          dispatch({
            type: 'SetNewMissionDialog',
            isOpen: false,
            startNow: true,
          })
        }
      >
        <NewMissionForm />
      </Dialog>
      {children}
    </TopBarContext.Provider>
  );
};
