import { createContext } from "react";

const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

export { ThemeContext };
