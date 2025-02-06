import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MsalProvider, useMsal } from "@azure/msal-react";
import LoginComponent from "../src/components/LoginComponent/LoginComponent";

jest.mock("@azure/msal-react", () => ({
  useMsal: jest.fn(),
  MsalProvider: ({ children }) => <div>{children}</div>,
}));

jest.mock("mfe_st_utils/Crypto", () => ({
  encrypt: jest.fn((data) => `mock-encrypted-${data}`),
}));

describe("LoginComponent", () => {
  let mockInstance;

  beforeEach(() => {
    mockInstance = {
      loginPopup: jest.fn(),
    };
    useMsal.mockReturnValue({ instance: mockInstance });
    jest.spyOn(window.localStorage.__proto__, "setItem").mockImplementation(() => {});
    delete window.location;
    window.location = { href: "" };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders login button and text", () => {
    render(
      <MsalProvider instance={{}}>
        <LoginComponent />
      </MsalProvider>
    );

    expect(screen.getByText("Iniciar Sesión")).toBeInTheDocument();
    expect(screen.getByText("Por favor, inicia sesión para continuar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Iniciar Sesión con Microsoft/i })).toBeInTheDocument();
  });

  test("calls loginPopup and stores user on successful login", async () => {
    const mockUser = { username: "testuser@example.com" };
    mockInstance.loginPopup.mockResolvedValue({ account: mockUser });

    render(
      <MsalProvider instance={{}}>
        <LoginComponent />
      </MsalProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /Iniciar Sesión con Microsoft/i }));

    await waitFor(() => {
      expect(mockInstance.loginPopup).toHaveBeenCalledWith({ scopes: ["User.Read"] });
      expect(localStorage.setItem).toHaveBeenCalledWith("user", "mock-encrypted-{\"username\":\"testuser@example.com\"}");
      expect(window.location.href).toBe("/");
    });
  });

  test("does not store user when loginPopup returns null account", async () => {
    mockInstance.loginPopup.mockResolvedValue({ account: null });
  
    render(
      <MsalProvider instance={{}}>
        <LoginComponent />
      </MsalProvider>
    );
  
    fireEvent.click(screen.getByRole("button", { name: /Iniciar Sesión con Microsoft/i }));
  
    await waitFor(() => {
      expect(mockInstance.loginPopup).toHaveBeenCalledWith({ scopes: ["User.Read"] });
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(window.location.href).not.toBe("/");
    });
  });
  

  test("handles login error gracefully", async () => {
    console.error = jest.fn();
    mockInstance.loginPopup.mockRejectedValue(new Error("Login failed"));

    render(
      <MsalProvider instance={{}}>
        <LoginComponent />
      </MsalProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /Iniciar Sesión con Microsoft/i }));

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Error al iniciar sesión:", expect.any(Error));
    });
  });
});
