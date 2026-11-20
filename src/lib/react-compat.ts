import React from "react";

export function ensureReact19Compat(): void {
  const reactAny = React as unknown as Record<string, unknown>;
  const clientInternals =
    (reactAny.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE ||
      reactAny.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) as
      | Record<string, unknown>
      | undefined;

  if (clientInternals) {
    if (!reactAny.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
      reactAny.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = clientInternals;
    }

    if (!clientInternals.ReactCurrentDispatcher) {
      Object.defineProperty(clientInternals, "ReactCurrentDispatcher", {
        configurable: true,
        enumerable: true,
        get() {
          return {
            get current() {
              return clientInternals.H;
            },
            set current(value: unknown) {
              clientInternals.H = value;
            },
          };
        },
      });
    }

    if (!clientInternals.ReactCurrentOwner) {
      Object.defineProperty(clientInternals, "ReactCurrentOwner", {
        configurable: true,
        enumerable: true,
        get() {
          return {
            get current() {
              return clientInternals.A;
            },
            set current(value: unknown) {
              clientInternals.A = value;
            },
          };
        },
      });
    }

    let extraStack: string | null = null;
    const debugFrame = (clientInternals.ReactDebugCurrentFrame || {}) as Record<string, unknown>;
    if (typeof debugFrame.setExtraStackFrame !== "function") {
      debugFrame.setExtraStackFrame = (stack: string | null): void => {
        extraStack = stack;
      };
    }
    if (typeof debugFrame.getStackAddendum !== "function") {
      debugFrame.getStackAddendum = (): string => extraStack || "";
    }
    if (typeof debugFrame.getCurrentStack !== "function") {
      debugFrame.getCurrentStack = (): string => "";
    }
    clientInternals.ReactDebugCurrentFrame = debugFrame;
  }

  if (typeof window !== "undefined") {
    const winAny = window as unknown as Record<string, unknown>;
    if (!winAny.React) {
      winAny.React = React;
    }
  }
}

ensureReact19Compat();
