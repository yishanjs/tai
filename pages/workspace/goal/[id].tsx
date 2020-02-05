/**
 * Copyright (c) 2019 Yishan Authors
 *
 * All rights reserved
 */

import React from 'react';
import { NextPage } from 'next';

import { IGoal, ITodo, IRecord } from '@/src/model/schemas';
import { IPageProps, ITaiPageError } from '@/src/model/utils';
import { sf, HandleError } from '@/src/api';
import { withPageGuard } from '@/src/utils/auth';
import { WorkSpace } from '@/src/scopes/workspace';
import { DetailCard } from '@/src/scopes/workspace/components/detailCard';
import { WorkList } from '@/src/scopes/workspace/workList';

interface IProps extends IPageProps {
  goal: IGoal;
  todos: ITodo[];
  records: IRecord[];
}

const GoalDetail: NextPage<IProps> = ({ goal, todos, records }) => {
  return (
    <WorkSpace
      initialState={{
        minutes: goal.minutes,
        goalMission: {
          goalID: goal.id,
          goalTitle: goal.title,
        },
      }}
    >
      <DetailCard detail={{ ...goal, type: 'goal' }} />
      <WorkList todos={todos} records={records} />
    </WorkSpace>
  );
};

GoalDetail.getInitialProps = async ctx => {
  let goal: IGoal = null;
  let todos: ITodo[] = [];
  let records: IRecord[] = [];
  let err: ITaiPageError = null;
  try {
    [goal, todos, records] = await Promise.all([
      sf<IGoal>(`/goal/${ctx.query.id}`, {}, ctx),
      sf<ITodo[]>(`/todos`, { params: { goalID: ctx.query.id } }, ctx),
      sf<IRecord[]>(`/records`, { params: { goalID: ctx.query.id } }, ctx),
    ]);
  } catch (error) {
    err = HandleError(error);
  }
  return { goal, todos, records, err };
};

export default withPageGuard(GoalDetail);