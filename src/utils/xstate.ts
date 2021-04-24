import { createMachine, interpret } from "xstate";

interface ToggleContext {
  count: number;
}

type ToggleEvent = {
  type: "TOGGLE";
};

const machine = createMachine<ToggleContext, ToggleEvent>({
  id: "machine",
  initial: "inactive",
  context: {
    count: 0
  },
  states: {
    inactive: {
      on: { TOGGLE: "active" }
    },
    active: {
      on: { TOGGLE: "inactive" }
    }
  }
});

// Edit your service(s) here
const service = interpret(machine).onTransition((state) => {
  console.log(state.value);
});

service.start();

service.send("TOGGLE");
service.send("TOGGLE");
