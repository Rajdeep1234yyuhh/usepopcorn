import { useState, useEffect } from "react";
export function useLocalStorageState(initialState, key) {
  const [value, setValue] = useState(function () {
    const localStore = localStorage.getItem(key);
    return localStore ? JSON.parse(localStore) : initialState;
  });
  useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify(value));
    },
    [value, key]
  );
  return [value, setValue];
}
