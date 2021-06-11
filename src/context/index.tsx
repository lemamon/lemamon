import { createContext, useContext, useReducer } from "react";

type Action = { type: "select"; selected: string } | { type: "other-action" };
type Dispatch = (action: Action) => void;
type State = { selected: string };
type SelectProviderProps = { children: React.ReactNode };

const SelectStateContext =
  createContext<{ state: State; dispatch: Dispatch } | undefined>(undefined);

let isBlocked = false;

function countReducer(state: State, action: Action) {
  switch (action.type) {
    case "select": {
      if (isBlocked) return state;

      isBlocked = true;
      setTimeout(() => (isBlocked = false), 500);

      return {
        selected: action.selected,
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}
function SelectProvider({ children }: SelectProviderProps) {
  const { Provider } = SelectStateContext;
  const [state, dispatch] = useReducer(countReducer, { selected: "" });
  // NOTE: you *might* need to memoize this value
  // Learn more in http://kcd.im/optimize-context
  const value = { state, dispatch };
  return <Provider value={value}>{children}</Provider>;
}
function useSelect() {
  const context = useContext(SelectStateContext);
  if (context === undefined) {
    throw new Error("useCount must be used within a CountProvider");
  }
  return context;
}
export { SelectProvider, useSelect };
