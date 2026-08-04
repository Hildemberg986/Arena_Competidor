// stores/auth.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authService } from "@/services/api";
import router from "@/router/index";

export const useAuthStore = defineStore("auth", () => {
  // ========== STATE ==========
  const user = ref(null);
  const token = ref(localStorage.getItem("access_token") || null);
  const tokenType = ref(localStorage.getItem("token_type") || "bearer");
  const adminToken = ref(localStorage.getItem("adminToken") || null);
  const appModo = ref(localStorage.getItem("app_modo") || null);
  const loading = ref(false);
  const error = ref("");

  // ========== GETTERS ==========
  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => isAuthenticated.value && !!adminToken.value);
  const isPortaria = computed(
    () => isAuthenticated.value && adminToken.value === "portaria",
  );
  const userName = computed(() => {
    if (!user.value) return "";
    return user.value.nome_completo?.split(" ")[0] || user.value.email || "";
  });
  const userEmail = computed(() => user.value?.email || "");

  // ========== ACTIONS ==========
  function setAppModo(modo) {
    appModo.value = modo;
    localStorage.setItem("app_modo", modo);
  }

  async function loginCliente(email, password) {
    loading.value = true;
    error.value = "";
    try {
      const data = await authService.login(email, password);
      salvarSessao(data);
      setAppModo("cliente");
      return data;
    } catch (err) {
      error.value =
        err?.response?.data?.detail || err.message || "Falha ao entrar";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function loginAdmin(email, password, tokenAdmin) {
    loading.value = true;
    error.value = "";
    try {
      const data = await authService.login(email, password);
      salvarSessao(data);
      adminToken.value = tokenAdmin || "implicito";
      localStorage.setItem("adminToken", adminToken.value);
      setAppModo("admin");
      return data;
    } catch (err) {
      error.value =
        err?.response?.data?.detail || err.message || "Falha ao entrar";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function loginPortaria(email, password, codigo) {
    loading.value = true;
    error.value = "";
    try {
      const data = await authService.login(email, password);
      salvarSessao(data);
      adminToken.value = codigo || "portaria";
      localStorage.setItem("adminToken", adminToken.value);
      setAppModo("portaria");
      return data;
    } catch (err) {
      error.value =
        err?.response?.data?.detail || err.message || "Falha ao entrar";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function register(payload) {
    loading.value = true;
    error.value = "";
    try {
      const data = await authService.register(payload);
      return data;
    } catch (err) {
      error.value =
        err?.response?.data?.detail || err.message || "Falha ao cadastrar";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchUser() {
    if (!token.value) return;
    try {
      const response = await authService.me();
      user.value = response?.data || response;
    } catch {
      logout();
    }
  }

  function salvarSessao(data) {
    token.value = data.access_token;
    tokenType.value = data.token_type || "bearer";
    user.value = data.user || data.cliente || null;

    localStorage.setItem("access_token", token.value);
    localStorage.setItem("token_type", tokenType.value);
    if (user.value) {
      localStorage.setItem("user", JSON.stringify(user.value));
    }
  }

  function logout() {
    token.value = null;
    tokenType.value = "bearer";
    user.value = null;
    adminToken.value = null;
    error.value = "";

    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("user");
    localStorage.removeItem("cliente");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("adminToken");
    // Mantém app_modo para saber qual login mostrar
  }

  function logoutTotal() {
    logout();
    appModo.value = null;
    localStorage.removeItem("app_modo");
    router.push("/bem-vindo");
  }

  function redirecionarPorModo() {
    switch (appModo.value) {
      case "admin":
        router.push("/admin");
        break;
      case "portaria":
        router.push("/admin/checkin");
        break;
      default:
        router.push("/");
    }
  }

  // Inicializa
  async function init() {
    if (token.value) {
      await fetchUser();
    }
  }

  return {
    // State
    user,
    token,
    tokenType,
    adminToken,
    appModo,
    loading,
    error,
    // Getters
    isAuthenticated,
    isAdmin,
    isPortaria,
    userName,
    userEmail,
    // Actions
    setAppModo,
    loginCliente,
    loginAdmin,
    loginPortaria,
    register,
    fetchUser,
    logout,
    logoutTotal,
    redirecionarPorModo,
    init,
  };
});
