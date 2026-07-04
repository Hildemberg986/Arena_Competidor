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
  history: createWebHashHistory(), // Remove o VITE_BASE_URL daqui
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach((to) => {
  if (!to.path.startsWith("/admin")) {
    return true;
  }

  const hasAdminToken =
    typeof window !== "undefined" &&
    Boolean(window.localStorage.getItem("adminToken"));

  if (to.name === "admin-login") {
    if (hasAdminToken) {
      return { name: "admin-campeonatos" };
    }

    return true;
  }

  if (!hasAdminToken) {
    return {
      name: "admin-login",
      query: {
        redirect: to.fullPath,
      },
    };
  }

  return true;
});

export default router;
