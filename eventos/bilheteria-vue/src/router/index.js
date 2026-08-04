// router/index.js
import { createRouter, createWebHashHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/campeonato/:id",
    name: "campeonato",
    component: () => import("@/views/CampeonatoView.vue"),
    props: true,
  },
  {
    path: "/bem-vindo",
    name: "welcome",
    component: () => import("@/views/WelcomeView.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/LoginView.vue"),
  },
  {
    path: "/admin/login",
    name: "admin-login",
    component: () => import("@/views/admin/LoginView.vue"),
  },
  {
    path: "/portaria/login",
    name: "portaria-login",
    component: () => import("@/views/portaria/PortariaLoginView.vue"),
  },
  {
    path: "/portaria",
    component: () => import("@/views/portaria/PortariaLayout.vue"),
    children: [
      {
        path: "",
        name: "portaria-checkin",
        component: () => import("@/views/portaria/PortariaCheckinView.vue"),
      },
    ],
  },
  {
    path: "/admin",
    component: () => import("@/views/admin/AdminLayout.vue"),
    children: [
      {
        path: "",
        redirect: { name: "admin-campeonatos" },
      },
      {
        path: "campeonatos",
        name: "admin-campeonatos",
        component: () =>
          import("@/views/admin/campeonatos/CampeonatosView.vue"),
      },
      {
        path: "lotes",
        name: "admin-lotes",
        component: () => import("@/views/admin/lotes/LotesView.vue"),
      },
      {
        path: "tipos-inscricao",
        name: "admin-tipos-inscricao",
        component: () =>
          import("@/views/admin/tipos-inscricao/TiposInscricaoView.vue"),
      },
      {
        path: "precos",
        name: "admin-precos",
        component: () => import("@/views/admin/precos/PrecosView.vue"),
      },
      {
        path: "pagamento-manual",
        name: "admin-pagamento-manual",
        component: () =>
          import("@/views/admin/pagamento-manual/PagamentoManualView.vue"),
      },
      {
        path: "checkin",
        name: "admin-checkin",
        component: () => import("@/views/admin/checkin/CheckinView.vue"),
      },
    ],
  },
  {
    path: "/cadastro",
    name: "cadastro",
    component: () => import("@/views/CadastroView.vue"),
  },
  {
    path: "/meus-ingressos",
    name: "meus-ingressos",
    component: () => import("@/views/MeusIngressosView.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

// ========== GUARD GLOBAL ==========
router.beforeEach((to) => {
  const token = localStorage.getItem("access_token");
  const appModo = localStorage.getItem("app_modo");
  const adminToken = localStorage.getItem("adminToken");

  // 1. Se está na raiz ou bem-vindo e já tem modo + token → redireciona direto
  if ((to.path === "/" || to.path === "/bem-vindo") && token && appModo) {
    switch (appModo) {
      case "admin":
        return "/admin";
      case "portaria":
        return "/portaria";
      default:
        return true;
    }
  }

  // 2. Se está no bem-vindo com modo mas sem token → vai pro login certo
  if (to.path === "/bem-vindo" && appModo && !token) {
    switch (appModo) {
      case "admin":
        return "/admin/login";
      case "portaria":
        return "/portaria/login";
      default:
        return "/";
    }
  }

  // 3. Proteção de rotas admin
  if (to.path.startsWith("/admin")) {
    if (to.name === "admin-login") {
      if (adminToken) return { name: "admin-campeonatos" };
      return true;
    }
    if (!adminToken) {
      return { name: "admin-login", query: { redirect: to.fullPath } };
    }
  }

  // 4. Proteção da rota de portaria
  if (to.path.startsWith("/portaria")) {
    if (to.name === "portaria-login") {
      if (adminToken) return "/portaria";
      return true;
    }
    if (!adminToken) {
      return { name: "portaria-login", query: { redirect: to.fullPath } };
    }
  }

  return true;
});

export default router;
