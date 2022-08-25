import { useMachine } from "@xstate/react";
import { useEffect } from "react";
import { parentMachine } from "./parent.machine";

const stringifiedState = localStorage.getItem("parent.machine");
const persistedState = stringifiedState
  ? JSON.parse(stringifiedState)
  : parentMachine.initialState;

export const App = () => {
  const [state, send, service] = useMachine(parentMachine, {
    devTools: true,
    state: persistedState,
  });

  useEffect(() => {
    const subscription = service.subscribe((state) => {
      localStorage.setItem("parent.machine", JSON.stringify(state));
    });

    return subscription.unsubscribe;
  }, [service]);

  const parsedChildren = Object.values(state.context.children ?? {}).reduce(
    (acc, child) => ({
      ...acc,
      [child.id]: child.getSnapshot?.()?.value,
    }),
    {}
  );
  return (
    <>
      <pre>{JSON.stringify(state.value)}</pre>
      <pre>{JSON.stringify(parsedChildren, null, 2)}</pre>
      <button onClick={() => send("moveToTransition")}>
        Move to transition
      </button>
      <button onClick={() => send("moveToInitial")}>Move to initial</button>
      <button onClick={() => send("spawnChild")}>Spawn child</button>
      <button onClick={() => send("moveChildrenToSecond")}>
        Move children to second state
      </button>
    </>
  );
};
