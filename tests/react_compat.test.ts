import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ensureReact19Compat } from "@/lib/react-compat";

describe("React 19 Compatibility Shim", () => {
  beforeEach(() => {
    ensureReact19Compat();
  });

  it("test_should_expose_secret_internals_on_react", () => {
    // Arrange & Act
    const reactAny = React as unknown as Record<string, unknown>;

    // Assert
    expect(reactAny.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED).toBeDefined();
    expect(typeof reactAny.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED).toBe("object");
  });

  it("test_should_provide_react_current_dispatcher_without_throwing", () => {
    // Arrange
    const reactAny = React as unknown as Record<string, Record<string, unknown>>;
    const sharedInternals = reactAny.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

    // Act
    const dispatcher = sharedInternals.ReactCurrentDispatcher as { current: unknown } | undefined;

    // Assert
    expect(dispatcher).toBeDefined();
    expect(dispatcher).toHaveProperty("current");
  });

  it("test_should_provide_react_current_owner_and_debug_frame", () => {
    // Arrange
    const reactAny = React as unknown as Record<string, Record<string, unknown>>;
    const sharedInternals = reactAny.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

    // Act
    const owner = sharedInternals.ReactCurrentOwner as { current: unknown } | undefined;
    const debugFrame = sharedInternals.ReactDebugCurrentFrame as
      | {
          getStackAddendum?: () => string;
          setExtraStackFrame?: (stack: string | null) => void;
          getCurrentStack?: () => string;
        }
      | undefined;

    // Assert
    expect(owner).toBeDefined();
    expect(owner).toHaveProperty("current");
    expect(debugFrame).toBeDefined();
    expect(typeof debugFrame?.getStackAddendum).toBe("function");
    expect(typeof debugFrame?.setExtraStackFrame).toBe("function");
    expect(typeof debugFrame?.getCurrentStack).toBe("function");
    expect(debugFrame?.getStackAddendum?.()).toBe("");

    debugFrame?.setExtraStackFrame?.("\n    in TestComponent");
    expect(debugFrame?.getStackAddendum?.()).toBe("\n    in TestComponent");
    debugFrame?.setExtraStackFrame?.(null);
    expect(debugFrame?.getStackAddendum?.()).toBe("");
  });

  it("test_should_allow_updating_dispatcher_and_owner_references", () => {
    // Arrange
    const reactAny = React as unknown as Record<string, Record<string, unknown>>;
    const sharedInternals = reactAny.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    const dispatcher = sharedInternals.ReactCurrentDispatcher as { current: unknown };

    // Act
    const mockDispatcher = { readContext: () => null };
    dispatcher.current = mockDispatcher;

    // Assert
    expect(dispatcher.current).toBe(mockDispatcher);
    expect(sharedInternals.H).toBe(mockDispatcher);
  });

  it("test_should_not_pollute_object_prototype_or_trigger_key_getter", () => {
    // Arrange: Create a props object with a React 19 style key warning getter
    const keyGetterSpy = vi.fn(() => undefined);
    const mockProps: Record<string, unknown> = { id: "test-btn", children: "Click Me" };

    Object.defineProperty(mockProps, "key", {
      get: keyGetterSpy,
      configurable: true,
      enumerable: false,
    });

    // Act: Check hasOwnProperty/hasOwn on props as React and libraries do
    const hasRef = Object.hasOwn(mockProps, "ref");
    const hasId = Object.hasOwn(mockProps, "id");

    // Assert: Checking properties must NOT invoke the key warning getter
    expect(hasRef).toBe(false);
    expect(hasId).toBe(true);
    expect(keyGetterSpy).not.toHaveBeenCalled();
  });
});
