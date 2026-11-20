import React from "react";
import ReactDOMServer from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";
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
      | { getStackAddendum?: () => string }
      | undefined;

    // Assert
    expect(owner).toBeDefined();
    expect(owner).toHaveProperty("current");
    expect(debugFrame).toBeDefined();
    expect(typeof debugFrame?.getStackAddendum).toBe("function");
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

  it("test_should_bridge_react_element_symbol_to_transitional_element", () => {
    // Arrange & Act
    const elementSymbol = Symbol.for("react.element");
    const otherSymbol = Symbol.for("react.fragment");

    // Assert
    expect(elementSymbol.toString()).toBe("Symbol(react.transitional.element)");
    expect(otherSymbol.toString()).toBe("Symbol(react.fragment)");
  });

  it("test_should_render_bridged_element_through_react_reconciler_without_legacy_error", () => {
    // Arrange
    const bridgedElement = {
      $$typeof: Symbol.for("react.element"),
      type: "div",
      key: null,
      ref: null,
      props: { id: "test-canvas-container", children: "Canvas Content" },
      _owner: null,
    };

    // Act
    const html = ReactDOMServer.renderToString(bridgedElement as unknown as React.ReactElement);

    // Assert
    expect(html).toBe('<div id="test-canvas-container">Canvas Content</div>');
  });

  it("test_should_preserve_ref_on_props_when_simulating_react18_jsx_runtime", () => {
    // Arrange
    const reservedProps = { key: true, ref: true, __self: true, __source: true };
    const config = { id: "canvas-ref-test", ref: { current: "mock-dom-node" } };
    const props: Record<string, unknown> = {};

    // Act: Simulate React 18 JSX runtime property filtering
    for (const prop in config) {
      if (Object.hasOwn(config, prop) && !Object.hasOwn(reservedProps, prop)) {
        props[prop] = (config as Record<string, unknown>)[prop];
      }
    }

    // Simulate React 18 defineRefPropWarningGetter attempt
    const warningFn = () => undefined;
    (warningFn as unknown as { isReactWarning: boolean }).isReactWarning = true;
    Object.defineProperty(props, "ref", {
      get: warningFn,
      configurable: true,
    });

    // Assert
    expect(props).toHaveProperty("ref");
    expect(props.ref).toEqual({ current: "mock-dom-node" });
  });

  it("test_should_attach_ref_to_props_via_element_self_construction", () => {
    // Arrange
    const mockRef = { current: "canvas-container-node" };
    const props: Record<string, unknown> = { id: "excalidraw-container" };
    const element = {
      $$typeof: Symbol.for("react.element"),
      type: "div",
      key: null,
      ref: mockRef,
      props,
      _owner: null,
    };

    // Act: Simulate React 18 ReactElement initialization (_self assignment)
    Object.defineProperty(element, "_self", {
      configurable: false,
      enumerable: false,
      writable: false,
      value: null,
    });

    // Assert: In React 19, coerceRef reads element.props.ref
    expect(element.props.ref).toBe(mockRef);
  });
});
