import React from "react";
import { useMsal } from "@azure/msal-react";
import { encrypt } from "mfe_st_utils/Crypto";

const LoginComponent: React.FC = () => {
  const { instance } = useMsal();

  const handleLogin = async () => {
    try {
      const response = await instance.loginPopup({
        scopes: ["User.Read"],
      });

      const user = response.account;

      if (user) {
        await localStorage.setItem("user", encrypt(JSON.stringify(user)));
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md text-center">
      <h1 className="text-2xl font-bold mb-4">Iniciar Sesión</h1>
      <p className="mb-6 text-gray-600">
        Por favor, inicia sesión para continuar
      </p>
      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Iniciar Sesión con Microsoft
      </button>
    </div>
  );
};

export default LoginComponent;
