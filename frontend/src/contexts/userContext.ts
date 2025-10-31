import { createContext } from "react";

export const userContext = createContext<{
  username: string;
  setUsername: (name: string) => void;
}>({
  username: "",
  setUsername: () => {},
});
