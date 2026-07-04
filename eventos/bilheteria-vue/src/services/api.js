import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function getStorageItem(key) {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(key);
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

const adminApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getStorageItem("access_token");
  if (token) {
    const tokenType = getStorageItem("token_type") || "bearer";
    config.headers.Authorization = `${tokenType} ${token}`;
  }
  return config;
});

adminApiClient.interceptors.request.use((config) => {
  const token = getStorageItem("access_token");
  const adminToken = getStorageItem("adminToken");

  if (token) {
    const tokenType = getStorageItem("token_type") || "bearer";
    config.headers.Authorization = `${tokenType} ${token}`;
  }

  if (adminToken) {
    config.headers["X-Admin-Key"] = adminToken;
  }

  return config;
});

export const eventsService = {
  async getEvents() {
    const response = await apiClient.get("/campeonatos/");
    return response.data;
  },

  async getEventById(id) {
    const response = await apiClient.get(`/campeonatos/${id}`);
    return response.data;
  },

  async getTiposInscricaoByCampeonatoId(id) {
    const response = await apiClient.get(`/tipos-inscricao/campeonato/${id}`);
    return response.data;
  },

  async getPrecosByCampeonatoId(id) {
    const response = await apiClient.get(`/precos/campeonato/${id}`);
    return response.data;
  },
};

export const authService = {
  async login(email, senha) {
    const response = await apiClient.post("/auth/login", { email, senha });
    return response.data;
  },

  async me() {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  async register(payload) {
    const response = await apiClient.post("/auth/registro", payload);
    return response.data;
  },
};

export const ticketsService = {
  async getMyTickets() {
    const response = await apiClient.get("/tickets/meus");
    return response.data;
  },

  async createTicket(payload) {
    const response = await apiClient.post("/tickets/", payload);
    return response.data;
  },

  async downloadTicketPDF(ticketId) {
    const token = getStorageItem("access_token");
    const tokenType = getStorageItem("token_type") || "bearer";

    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/pdf`, {
      headers: {
        Authorization: `${tokenType} ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao baixar PDF");
    }

    return response.blob();
  },
};

export const adminService = {
  // Campeonatos
  async getCampeonatos() {
    const response = await adminApiClient.get("/campeonatos/");
    return response.data;
  },

  async getCampeonatoById(id) {
    const response = await adminApiClient.get(`/campeonatos/${id}`);
    return response.data;
  },

  async createCampeonato(payload) {
    const response = await adminApiClient.post("/campeonatos/", payload);
    return response.data;
  },

  async updateCampeonato(id, payload) {
    const response = await adminApiClient.put(`/campeonatos/${id}`, payload);
    return response.data;
  },

  async deleteCampeonato(id) {
    const response = await adminApiClient.delete(`/campeonatos/${id}`);
    return response.data;
  },

  // Lotes
  async getLotes() {
    const response = await adminApiClient.get("/lotes/");
    return response.data;
  },

  async getLoteById(id) {
    const response = await adminApiClient.get(`/lotes/${id}`);
    return response.data;
  },

  async createLote(payload) {
    const response = await adminApiClient.post("/lotes/", payload);
    return response.data;
  },

  async updateLote(id, payload) {
    const response = await adminApiClient.put(`/lotes/${id}`, payload);
    return response.data;
  },

  async deleteLote(id) {
    const response = await adminApiClient.delete(`/lotes/${id}`);
    return response.data;
  },

  // Tipos de Inscrição
  async getTiposInscricao() {
    const response = await adminApiClient.get("/tipos-inscricao/");
    return response.data;
  },

  async getTipoInscricaoById(id) {
    const response = await adminApiClient.get(`/tipos-inscricao/${id}`);
    return response.data;
  },

  async createTipoInscricao(payload) {
    const response = await adminApiClient.post("/tipos-inscricao/", payload);
    return response.data;
  },

  async updateTipoInscricao(id, payload) {
    const response = await adminApiClient.put(`/tipos-inscricao/${id}`, payload);
    return response.data;
  },

  async deleteTipoInscricao(id) {
    const response = await adminApiClient.delete(`/tipos-inscricao/${id}`);
    return response.data;
  },

  // Preços
  async getPrecos() {
    const response = await adminApiClient.get("/precos/");
    return response.data;
  },

  async getPrecoById(id) {
    const response = await adminApiClient.get(`/precos/${id}`);
    return response.data;
  },

  async createPreco(payload) {
    const response = await adminApiClient.post("/precos/", payload);
    return response.data;
  },

  async updatePreco(id, payload) {
    const response = await adminApiClient.put(`/precos/${id}`, payload);
    return response.data;
  },

  async deletePreco(id) {
    const response = await adminApiClient.delete(`/precos/${id}`);
    return response.data;
  },

  // Tickets / Pagamento Manual / Check-in
  async getTickets() {
    const response = await adminApiClient.get("/tickets/");
    return response.data;
  },

  async getTicketByCodigo(codigo) {
    const response = await adminApiClient.get(`/tickets/codigo/${codigo}`);
    return response.data;
  },

  async pagarManual(ticketId) {
    const response = await adminApiClient.post(`/tickets/${ticketId}/pagar-manual`);
    return response.data;
  },

  async checkin(codigo) {
    const response = await adminApiClient.post(`/tickets/checkin/${codigo}`);
    return response.data;
  },
};