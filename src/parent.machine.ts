import { ActorRefFrom, createMachine, spawn } from "xstate";
import { assign } from "@xstate/immer";
import { nanoid } from "nanoid";
import { pure, send } from "xstate/lib/actions";

export const parentMachine = createMachine(
  {
    tsTypes: {} as import("./parent.machine.typegen").Typegen0,
    schema: {
      context: {
        children: {} as Record<string, ActorRefFrom<typeof childMachine>>,
      },
      events: {} as
        | { type: "spawnChild" }
        | { type: "moveToTransition" }
        | { type: "moveToInitial" }
        | { type: "moveChildrenToSecond" },
    },
    context: {
      children: {},
    },
    initial: "INITIAL",
    states: {
      INITIAL: {},
      TRANSITION: {},
      SPAWNED_CHILD: {},
    },
    on: {
      spawnChild: {
        actions: "spawnChild",
        target: "SPAWNED_CHILD",
      },
      moveToTransition: {
        target: "TRANSITION",
      },
      moveToInitial: {
        target: "INITIAL",
      },
      moveChildrenToSecond: {
        actions: "moveChildrenToSecond",
      },
    },
  },
  {
    actions: {
      spawnChild: assign((context) => {
        const id = nanoid();
        context.children[id] = spawn(childMachine, id);
      }),
      moveChildrenToSecond: pure((context) =>
        Object.entries(context.children).map(([key, machineRef]) =>
          send("moveToSecond", { to: key })
        )
      ),
    },
  }
);

const childMachine = createMachine({
  tsTypes: {} as import("./parent.machine.typegen").Typegen1,
  initial: "FIRST",
  schema: {
    events: {} as { type: "moveToSecond" } | { type: "moveToFirst" },
  },
  states: {
    FIRST: {
      on: {
        moveToSecond: "SECOND",
      },
    },
    SECOND: {
      on: {
        moveToFirst: "SECOND",
      },
    },
  },
});
