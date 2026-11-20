import React from "react";

export function ensureReact19Compat(): void {
  const reactAny = React as unknown as Record<string, unknown>;
  const clientInternals = (reactAny.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE ||
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

    if (!clientInternals.ReactDebugCurrentFrame) {
      clientInternals.ReactDebugCurrentFrame = {
        getStackAddendum(): string {
          return "";
        },
      };
    }

    if (!clientInternals.ReactCurrentBatchConfig) {
      Object.defineProperty(clientInternals, "ReactCurrentBatchConfig", {
        configurable: true,
        enumerable: true,
        get() {
          return {
            get transition() {
              return clientInternals.T;
            },
            set transition(value: unknown) {
              clientInternals.T = value;
            },
          };
        },
      });
    }
  }

  const origSymbolFor = Symbol.for;
  const transitionalSymbol = origSymbolFor("react.transitional.element");
  const symbolAny = Symbol as unknown as Record<string, unknown>;

  if (!symbolAny.__react19ElementBridged) {
    symbolAny.__react19ElementBridged = true;
    Symbol.for = function (key: string): symbol {
      if (key === "react.element") {
        return transitionalSymbol;
      }
      return origSymbolFor.call(Symbol, key);
    };
  }

  const globalAny = globalThis as unknown as Record<string, unknown>;
  if (!globalAny.__react19RefBridged) {
    globalAny.__react19RefBridged = true;

    const origHasOwnProperty = Object.prototype.hasOwnProperty;
    Object.prototype.hasOwnProperty = function (prop: PropertyKey): boolean {
      if (
        prop === "ref" &&
        this &&
        (this as Record<string, unknown>).key === true &&
        (this as Record<string, unknown>).ref === true &&
        (this as Record<string, unknown>).__self === true
      ) {
        return false;
      }
      return origHasOwnProperty.call(this, prop);
    };

    const origDefineProperty = Object.defineProperty;
    Object.defineProperty = function <T>(
      obj: T,
      prop: PropertyKey,
      descriptor: PropertyDescriptor & ThisType<unknown>
    ): T {
      if (
        prop === "ref" &&
        descriptor &&
        descriptor.get &&
        (descriptor.get as unknown as { isReactWarning?: boolean }).isReactWarning
      ) {
        return obj;
      }

      if (prop === "_self" && obj && (obj as Record<string, unknown>).props) {
        const elem = obj as Record<string, unknown>;
        if (elem.ref !== undefined) {
          try {
            origDefineProperty.call(Object, elem.props, "ref", {
              value: elem.ref,
              writable: true,
              enumerable: true,
              configurable: true,
            });
          } catch {}
        }
      }

      return origDefineProperty.call(Object, obj, prop, descriptor) as T;
    };
  }

  if (typeof window !== "undefined") {
    const winAny = window as unknown as Record<string, unknown>;
    if (!winAny.React) {
      winAny.React = React;
    }
  }
}

ensureReact19Compat();
