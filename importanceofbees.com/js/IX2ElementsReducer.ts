import {getIn, mergeIn} from 'timm';
import {
  IX2EngineActionTypes,
  IX2EngineConstants,
} from '@packages/systems/ix2/shared-constants';

const {
  HTML_ELEMENT,
  PLAIN_OBJECT,
  ABSTRACT_NODE,
  CONFIG_X_VALUE,
  CONFIG_Y_VALUE,
  CONFIG_Z_VALUE,
  CONFIG_VALUE,
  CONFIG_X_UNIT,
  CONFIG_Y_UNIT,
  CONFIG_Z_UNIT,
  CONFIG_UNIT,
} = IX2EngineConstants;

const {IX2_SESSION_STOPPED, IX2_INSTANCE_ADDED, IX2_ELEMENT_STATE_CHANGED} =
  IX2EngineActionTypes;

type RefTypes =
  | typeof HTML_ELEMENT
  | typeof PLAIN_OBJECT
  | typeof ABSTRACT_NODE;

type ActionState = {
  xValue?: number;
  yValue?: number;
  zValue?: number;
  value?: number;
  xUnit?: string;
  yUnit?: string;
  zUnit?: string;
  unit?: string;
};

type ElementsState = {
  [elementId: string]: {
    id: string;
    ref: unknown; // HTMLElement | Object;
    refId: string | null;
    refType: RefTypes;
    refState: {
      [actionTypeId: string]: ActionState;
    };
  };
};

const initialState: ElementsState = {};
const refState = 'refState';

export const ixElements = (
  state: ElementsState = initialState,
  action: Record<any, any> = {}
) => {
  switch (action.type) {
    case IX2_SESSION_STOPPED: {
      return initialState;
    }
    case IX2_INSTANCE_ADDED: {
      const {
        elementId,
        element: ref,
        origin,
        actionItem,
        refType,
      } = action.payload;

      const {actionTypeId} = actionItem;
      let newState = state;

      // Create new ref entry if it doesn't exist
      if (getIn(newState, [elementId, ref]) !== ref) {
        newState = createElementState(
          newState,
          ref,
          refType,
          elementId,
          actionItem
        );
      }

      // Merge origin values into ref state
      return mergeActionState(
        newState,
        elementId,
        actionTypeId,
        origin,
        actionItem
      );
    }
    case IX2_ELEMENT_STATE_CHANGED: {
      const {elementId, actionTypeId, current, actionItem} = action.payload;
      return mergeActionState(
        state,
        elementId,
        actionTypeId,
        current,
        actionItem
      );
    }
    default: {
      return state;
    }
  }
};

export function createElementState(
  state: ElementsState,
  ref: unknown,
  refType: RefTypes,
  elementId: string,
  actionItem: {
    [key: string]: any;
  }
) {
  const refId =
    refType === PLAIN_OBJECT
      ? getIn(actionItem, ['config', 'target', 'objectId'])
      : null;
  return mergeIn(state, [elementId], {
    id: elementId,
    ref,
    refId,
    refType,
  });
}

export function mergeActionState(
  state: ElementsState,
  elementId: string,
  actionTypeId: string,
  actionState: ActionState,
  actionItem: Record<any, any>
) {
  const units = pickUnits(actionItem);
  const mergePath = [elementId, refState, actionTypeId];
  return mergeIn(state, mergePath, actionState, units);
}

const valueUnitPairs = [
  [CONFIG_X_VALUE, CONFIG_X_UNIT],
  [CONFIG_Y_VALUE, CONFIG_Y_UNIT],
  [CONFIG_Z_VALUE, CONFIG_Z_UNIT],
  [CONFIG_VALUE, CONFIG_UNIT],
];

function pickUnits(actionItem: Record<any, any>) {
  const {config} = actionItem;
  return valueUnitPairs.reduce<Record<string, any>>((result, pair) => {
    const valueKey = pair[0];
    const unitKey = pair[1];
    // @ts-expect-error - TS2538 - Type 'undefined' cannot be used as an index type.
    const configValue = config[valueKey];
    // @ts-expect-error - TS2538 - Type 'undefined' cannot be used as an index type.
    const configUnit = config[unitKey];
    if (configValue != null && configUnit != null) {
      // @ts-expect-error - TS2538 - Type 'undefined' cannot be used as an index type.
      result[unitKey] = configUnit;
    }
    return result;
  }, {});
}
