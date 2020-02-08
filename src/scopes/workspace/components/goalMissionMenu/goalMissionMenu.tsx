/**
 * Copyright (c) 2019 Yishan Authors
 *
 * All rights reserved
 */
import React from 'react';

import {
  Popover,
  Menu,
  Position,
  Button,
  ButtonGroup,
  // Classes,
} from '@yishanzhilubp/core';

import { IGoalMission } from '@/src/model/schemas';

import { GoalMission } from '@/src/components/goalMission/goalMission';
import { eventHandlerWarning } from '@/src/utils/funcs';
import { useWorkSpaceContext } from '@/src/scopes/workspace';

import { GoalMenuItems } from './goalMenuItems';
import { MissionMenuItems } from './missionMenuItems';
import { useWorkProfileGoalsMissions } from './useWorkProfileGoalsMissions';

export const GoalMissionMenu = ({
  goalMission,
  emptyText,
  onSelectGoalMission = eventHandlerWarning('onSelectGoalMission'),
  disabled,
}: {
  goalMission: IGoalMission;
  emptyText?: string;
  disabled?: boolean;
  onSelectGoalMission?: (goalMission: IGoalMission) => void;
}) => {
  const {
    state: { goalMission: initailGoalMission },
  } = useWorkSpaceContext();
  const isSpecificMission = !!initailGoalMission.missionID;
  const onCross = React.useCallback(() => {
    if (initailGoalMission.goalID || initailGoalMission.missionID) {
      onSelectGoalMission(initailGoalMission);
    } else {
      onSelectGoalMission({ goalID: 0 });
    }
  }, [initailGoalMission]);

  const [goals, missions] = useWorkProfileGoalsMissions();
  return (
    <ButtonGroup>
      <Popover
        minimal
        disabled={isSpecificMission}
        autoFocus={false}
        content={
          <Menu>
            {goals.length ? (
              <GoalMenuItems
                memoGoals={goals}
                onSelectGoalMission={onSelectGoalMission}
              />
            ) : null}
            {missions.length ? (
              <MissionMenuItems
                memoMissions={missions}
                onSelectGoalMission={onSelectGoalMission}
              />
            ) : null}
          </Menu>
        }
        position={Position.BOTTOM_LEFT}
      >
        <Button small icon="swap-vertical" disabled={disabled}>
          <GoalMission
            isTag={false}
            goalMission={goalMission}
            emptyText={emptyText}
          />
        </Button>
      </Popover>
      {(goalMission.goalID || goalMission.missionID) && !isSpecificMission ? (
        <Button small disabled={disabled} onClick={onCross} icon="cross" />
      ) : null}
    </ButtonGroup>
  );
};
