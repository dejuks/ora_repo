import { createContext, useContext, useEffect, useMemo, useState } from "react";

const SidebarContext = createContext(null);

const getDefaultOpen = () => {
  if (typeof window === "undefined") return true;
  return window.innerWidth > 992;
};

export const SidebarProvider = ({ children }) => {
  const [open, setOpen] = useState(getDefaultOpen);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 992) {
        setOpen(true);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const value = useMemo(() => ({ open, setOpen }), [open]);

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};

export const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return ctx;
};
