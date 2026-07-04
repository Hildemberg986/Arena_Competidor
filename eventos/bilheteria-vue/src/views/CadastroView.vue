<template>
  <div class="auth-page">
    <div class="auth-card">
      <p class="eyebrow">Arena Competidor</p>
      <h1>Criar conta</h1>
      <p class="subtitle">Cadastre-se para continuar a inscrição.</p>

      <form class="auth-form" @submit.prevent="handleRegister">
        <label>
          Nome completo
          <input v-model.trim="name" type="text" autocomplete="name" required />
        </label>

        <label>
          E-mail
          <input
            v-model.trim="email"
            type="email"
            autocomplete="email"
            required
          />
        </label>

        <label>
          CPF
          <input
            v-model="cpf"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            maxlength="14"
            required
            @input="formatCPF"
          />
        </label>

        <label>
          Telefone
          <input
            v-model="phone"
            type="text"
            inputmode="tel"
            autocomplete="tel"
            maxlength="15"
            required
            @input="formatPhone"
          />
        </label>

        <label>
          Senha
          <div class="password-wrapper">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              required
              @input="validatePassword"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
            >
              <!-- Ícone de olho aberto (mostrar senha) -->
              <svg
                v-if="showPassword"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <!-- Ícone de olho fechado (ocultar senha) -->
              <svg
                v-else
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </button>
          </div>
          <div class="password-requirements">
            <span
              v-for="req in passwordRequirements"
              :key="req.id"
              class="req-item"
              :class="{ met: req.met }"
            >
              {{ req.label }}
            </span>
          </div>
        </label>

        <button
          class="primary-btn"
          type="submit"
          :disabled="!canSubmit || loading"
        >
          {{ loading ? "Criando..." : "Criar conta" }}
        </button>
      </form>

      <p v-if="error" class="error-text">{{ error }}</p>

      <div class="auth-links">
        <router-link :to="{ name: 'login', query: { redirect } }"
          >Já tenho conta</router-link
        >
        <router-link to="/">Voltar</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { authService } from "@/services/api";

const router = useRouter();
const route = useRoute();
const name = ref("");
const email = ref("");
const cpf = ref("");
const phone = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");
const redirect = route.query.redirect || "/";
const showPassword = ref(false);

// Validação de senha
const passwordRequirements = reactive([
  { id: 1, label: "Letra maiúscula", met: false },
  { id: 2, label: "Letra minúscula", met: false },
  { id: 3, label: "Número", met: false },
  { id: 4, label: "Caractere especial", met: false },
  { id: 5, label: "Mínimo 8 caracteres", met: false },
]);

function validatePassword() {
  const pwd = password.value;
  passwordRequirements[0].met = /[A-Z]/.test(pwd);
  passwordRequirements[1].met = /[a-z]/.test(pwd);
  passwordRequirements[2].met = /[0-9]/.test(pwd);
  passwordRequirements[3].met = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
  passwordRequirements[4].met = pwd.length >= 8;
}

// Formatação CPF
function formatCPF() {
  let value = cpf.value.replace(/\D/g, "");
  if (value.length > 11) value = value.slice(0, 11);

  if (value.length <= 3) {
    cpf.value = value;
  } else if (value.length <= 6) {
    cpf.value = `${value.slice(0, 3)}.${value.slice(3)}`;
  } else if (value.length <= 9) {
    cpf.value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
  } else {
    cpf.value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9, 11)}`;
  }
}

// Formatação Telefone
function formatPhone() {
  let value = phone.value.replace(/\D/g, "");
  if (value.length > 11) value = value.slice(0, 11);

  if (value.length <= 2) {
    phone.value = value;
  } else if (value.length <= 6) {
    phone.value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
  } else if (value.length <= 10) {
    phone.value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
  } else {
    phone.value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
  }
}

const canSubmit = computed(() => {
  const cpfDigits = cpf.value.replace(/\D/g, "");
  const phoneDigits = phone.value.replace(/\D/g, "");
  const allRequirementsMet = passwordRequirements.every((req) => req.met);

  return Boolean(
    name.value.trim() &&
    email.value.trim() &&
    cpfDigits.length === 11 &&
    phoneDigits.length >= 10 &&
    password.value.length >= 8 &&
    allRequirementsMet,
  );
});

async function handleRegister() {
  if (!canSubmit.value || loading.value) {
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    await authService.register({
      nome_completo: name.value.trim(),
      email: email.value.trim(),
      cpf: cpf.value.replace(/\D/g, ""),
      telefone: phone.value.replace(/\D/g, ""),
      senha: password.value,
    });

    router.push({ name: "login", query: { redirect } });
  } catch (err) {
    error.value =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err.message ||
      "Falha ao criar conta";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: linear-gradient(135deg, #f8fafc, #eef2ff);
}
.auth-card {
  width: min(100%, 420px);
  background: #fff;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
}
.eyebrow {
  color: var(--primary);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.78rem;
}
h1 {
  margin-top: 0.35rem;
  font-size: 2rem;
}
.subtitle {
  color: var(--text-light);
  margin: 0.35rem 0 1.25rem;
}
.auth-form {
  display: grid;
  gap: 0.9rem;
}
label {
  display: grid;
  gap: 0.45rem;
  font-weight: 700;
  color: var(--text);
}
input {
  height: 46px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 0 0.9rem;
  font: inherit;
  transition: border-color 0.2s;
}
input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* Wrapper da senha */
.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.password-wrapper input {
  flex: 1;
  padding-right: 3.5rem;
}
.toggle-password {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s;
  line-height: 1;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
}
.toggle-password:hover {
  background: #f1f5f9;
  color: #334155;
}
.toggle-password:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
.toggle-password svg {
  display: block;
}

.primary-btn {
  height: 48px;
  border: none;
  border-radius: 12px;
  background: var(--primary);
  color: #fff;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
}
.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
}
.primary-btn:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}
.error-text {
  margin-top: 0.85rem;
  color: #b91c1c;
  font-weight: 700;
}
.auth-links {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  font-size: 0.9rem;
}
a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 700;
}
a:hover {
  text-decoration: underline;
}

/* Requisitos de senha */
.password-requirements {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
}
.req-item {
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  background: #f1f5f9;
  color: #94a3b8;
  transition: all 0.3s ease;
}
.req-item.met {
  background: #dcfce7;
  color: #166534;
}
.req-item:not(.met) {
  opacity: 0.6;
}
</style>