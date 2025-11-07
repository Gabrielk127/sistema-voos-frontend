"use client";

import { useEffect, useState } from "react";
import { testAuth, listEmployeeCategories } from "@/lib/api-client";

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    console.log(message);
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);
  };

  const checkLocalStorage = () => {
    addLog("=== VERIFICANDO LOCALSTORAGE ===");
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("user");
    const isAuthenticated = localStorage.getItem("isAuthenticated");

    addLog(
      `authToken: ${token ? `${token.substring(0, 30)}...` : "NÃO ENCONTRADO"}`
    );
    addLog(`user: ${user ? user : "NÃO ENCONTRADO"}`);
    addLog(`isAuthenticated: ${isAuthenticated}`);

    if (user) {
      try {
        const userData = JSON.parse(user);
        addLog(`✓ User role: ${userData.role}`);
        addLog(`✓ User email: ${userData.email}`);
      } catch (e) {
        addLog("✗ Erro ao fazer parse do user JSON");
      }
    }
  };

  const testAuthFlow = async () => {
    setLoading(true);
    addLog("=== INICIANDO TESTE DE AUTENTICAÇÃO ===");

    try {
      const result = await testAuth();
      addLog("✓ Teste completado");
      addLog(`Status: ${result.status} ${result.statusText}`);
      addLog(`Response: ${JSON.stringify(result.data, null, 2)}`);
    } catch (error: any) {
      addLog(`✗ Erro no teste: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testEmployeeCategories = async () => {
    setLoading(true);
    addLog("=== TESTANDO EMPLOYEE CATEGORIES ===");

    try {
      const categories = await listEmployeeCategories();
      addLog("✓ Categorias carregadas com sucesso");
      addLog(`Quantidade: ${categories.length}`);
      categories.forEach((cat: any) => {
        addLog(
          `  - ID: ${cat.id}, Type: ${cat.type}, Description: ${cat.description}`
        );
      });
    } catch (error: any) {
      addLog(`✗ Erro ao carregar categorias: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    addLog("Logs limpos");
  };

  const clearLocalStorage = () => {
    localStorage.clear();
    addLog("localStorage limpo - você será redirecionado");
    setTimeout(() => {
      window.location.href = "/";
    }, 2000);
  };

  useEffect(() => {
    addLog("Página de debug carregada");
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Debug - Autenticação</h1>

        <div className="bg-gray-800 rounded-lg p-6 mb-8 space-y-4">
          <button
            onClick={checkLocalStorage}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-semibold"
          >
            1. Verificar localStorage
          </button>

          <button
            onClick={testAuthFlow}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded font-semibold disabled:opacity-50"
          >
            {loading ? "Testando..." : "2. Testar Autenticação"}
          </button>

          <button
            onClick={testEmployeeCategories}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded font-semibold disabled:opacity-50"
          >
            {loading ? "Testando..." : "3. Testar Employee Categories"}
          </button>

          <button
            onClick={clearLogs}
            className="bg-yellow-600 hover:bg-yellow-700 px-6 py-2 rounded font-semibold"
          >
            Limpar Logs
          </button>

          <button
            onClick={clearLocalStorage}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-semibold"
          >
            Limpar localStorage
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 h-96 overflow-y-auto font-mono text-sm space-y-1">
          {logs.length === 0 ? (
            <p className="text-gray-500">
              Clique nos botões acima para começar...
            </p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="text-gray-300">
                {log}
              </div>
            ))
          )}
        </div>

        <div className="mt-8 bg-gray-800 rounded-lg p-6 text-sm">
          <h2 className="text-xl font-bold mb-4">Instruções:</h2>
          <ol className="space-y-2 list-decimal list-inside">
            <li>
              Clique em "1. Verificar localStorage" para ver se os tokens estão
              salvos
            </li>
            <li>
              Se os tokens não aparecerem, você precisa fazer login novamente
            </li>
            <li>
              Clique em "2. Testar Autenticação" para fazer um teste real com a
              API
            </li>
            <li>
              Clique em "3. Testar Employee Categories" para verificar se as
              categorias estão carregando corretamente
            </li>
            <li>
              Se algo falhar, verifique o erro na mensagem e no console (F12)
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
