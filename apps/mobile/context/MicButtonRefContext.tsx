import React, { createContext, useContext, useRef } from "react";
import type { View } from "react-native";

const MicButtonRefContext = createContext<React.RefObject<View> | null>(null);

export function MicButtonRefProvider({
  children,
}: {
  readonly children: React.ReactNode;
}): React.ReactElement {
  const micRef = useRef<View>(null);
  return (
    <MicButtonRefContext.Provider value={micRef}>
      {children}
    </MicButtonRefContext.Provider>
  );
}

export function useMicButtonRef(): React.RefObject<View> | null {
  return useContext(MicButtonRefContext);
}
