"use client";

import { createContext, useContext } from "react";

export interface DataRefreshContextValue {
  refreshNow: () => void;
}

export const DataRefreshContext = createContext<DataRefreshContextValue | null>(
  null
);

const noopRefresh: DataRefreshContextValue = {
  refreshNow: () => {},
};

export function useDataRefresh(): DataRefreshContextValue {
  return useContext(DataRefreshContext) ?? noopRefresh;
}
