<template>
  <div class="auth-page">
    <div class="auth-card">
      <p class="eyebrow">Arena Competidor</p>
      <h1>Criar conta</h1>
      <p class="subtitle">Cadastre-se para continuar a inscrição.</p>

      <form class="auth-form" @submit.prevent="handleRegister">
        <label>
          Nome completo
          <input
            v-model.trim="name"
            type="text"
            autocomplete="name"
            required
            placeholder="Seu nome completo"
          />
        </label>

        <label>
          E-mail
          <input
            v-model.trim="email"
            type="email"
            autocomplete="email"
            required
            placeholder="seu@email.com"
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
            placeholder="000.000.000-00"
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
            placeholder="(00) 00000-0000"
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
              placeholder="Mínimo 8 caracteres"
              @input="validatePassword"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
            >
              <i
                :class="
                  showPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'
                "
              ></i>
            </button>
          </div>
          <div class="password-requirements">
            <span
              v-for="req in passwordRequirements"
              :key="req.id"
              class="req-item"
              :class="{ met: req.met }"
            >
              <i
                :class="
                  req.met ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle'
                "
              ></i>
              {{ req.label }}
            </span>
          </div>
        </label>

        <button
          class="primary-btn"
          type="submit"
          :disabled="!canSubmit || loading"
        >
          <i v-if="loading" class="fa-solid fa-spinner fa-spin"></i>
          {{ loading ? "Criando..." : "Criar conta" }}
        </button>
      </form>

      <p v-if="error" class="error-text">
        <i class="fa-solid fa-circle-exclamation"></i> {{ error }}
      </p>

      <div class="auth-links">
        <router-link :to="{ name: 'login', query: { redirect } }"
          >← Já tenho conta</router-link
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

const passwordRequirements = reactive([
  { id: 1, label: "Maiúscula", met: false },
  { id: 2, label: "Minúscula", met: false },
  { id: 3, label: "Número", met: false },
  { id: 4, label: "Especial", met: false },
  { id: 5, label: "8+ caracteres", met: false },
]);

function validatePassword() {
  const pwd = password.value;
  passwordRequirements[0].met = /[A-Z]/.test(pwd);
  passwordRequirements[1].met = /[a-z]/.test(pwd);
  passwordRequirements[2].met = /[0-9]/.test(pwd);
  passwordRequirements[3].met = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
  passwordRequirements[4].met = pwd.length >= 8;
}

function formatCPF() {
  let value = cpf.value.replace(/\D/g, "");
  if (value.length > 11) value = value.slice(0, 11);
  if (value.length <= 3) cpf.value = value;
  else if (value.length <= 6)
    cpf.value = `${value.slice(0, 3)}.${value.slice(3)}`;
  else if (value.length <= 9)
    cpf.value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
  else
    cpf.value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9, 11)}`;
}

function formatPhone() {
  let value = phone.value.replace(/\D/g, "");
  if (value.length > 11) value = value.slice(0, 11);
  if (value.length <= 2) phone.value = value;
  else if (value.length <= 6)
    phone.value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
  else if (value.length <= 10)
    phone.value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
  else
    phone.value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
}

const canSubmit = computed(() => {
  const cpfDigits = cpf.value.replace(/\D/g, "");
  const phoneDigits = phone.value.replace(/\D/g, "");
  return Boolean(
    name.value.trim() &&
    email.value.trim() &&
    cpfDigits.length === 11 &&
    phoneDigits.length >= 10 &&
    password.value.length >= 8 &&
    passwordRequirements.every((r) => r.met),
  );
});

async function handleRegister() {
  if (!canSubmit.value || loading.value) return;
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
/* ============================================ */
/* GERAL */
/* ============================================ */
.auth-page {
  min-height: 100dvh;
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
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.1);
  animation: fadeUp 0.4s ease;
}
.eyebrow {
  color: var(--primary);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 0.7rem;
}
h1 {
  margin-top: 0.3rem;
  font-size: 1.5rem;
}
.subtitle {
  color: var(--text-light);
  margin: 0.3rem 0 1.25rem;
  font-size: 0.85rem;
}

/* ============================================ */
/* FORM */
/* ============================================ */
.auth-form {
  display: grid;
  gap: 0.85rem;
}
label {
  display: grid;
  gap: 0.35rem;
  font-weight: 700;
  color: var(--text);
  font-size: 0.85rem;
}

input {
  height: 46px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 0 0.85rem;
  font: inherit;
  font-size: 0.9rem;
  background: #fff;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  box-sizing: border-box;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(230, 33, 23, 0.1);
}
input::placeholder {
  color: #94a3b8;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.password-wrapper input {
  flex: 1;
  padding-right: 2.75rem;
}
.toggle-password {
  position: absolute;
  right: 0.4rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 8px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
}
.toggle-password:active {
  background: #f1f5f9;
  color: #64748b;
}

.primary-btn {
  height: 48px;
  border: none;
  border-radius: 12px;
  background: var(--primary);
  color: #fff;
  font-weight: 800;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
  -webkit-tap-highlight-color: transparent;
}
.primary-btn:active {
  background: #c81e14;
}
.primary-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* ============================================ */
/* PASSWORD REQUIREMENTS */
/* ============================================ */
.password-requirements {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.25rem;
}
.req-item {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 20px;
  background: #f1f5f9;
  color: #94a3b8;
  transition: all 0.3s ease;
}
.req-item.met {
  background: #dcfce7;
  color: #166534;
}
.req-item i {
  font-size: 0.6rem;
}

/* ============================================ */
/* ERROR */
/* ============================================ */
.error-text {
  margin-top: 0.85rem;
  color: #b91c1c;
  font-weight: 600;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #fef2f2;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
}

/* ============================================ */
/* LINKS */
/* ============================================ */
.auth-links {
  display: flex;
  justify-content: space-between;
  margin-top: 1.25rem;
  font-size: 0.85rem;
}
.auth-links a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 700;
}
.auth-links a:active {
  color: #c81e14;
}

/* ============================================ */
/* MOBILE */
/* ============================================ */
@media (max-width: 480px) {
  .auth-page {
    padding: 0.75rem;
    align-items: flex-start;
    padding-top: 1.5rem;
  }
  .auth-card {
    padding: 1.5rem;
    border-radius: 20px;
  }
  h1 {
    font-size: 1.3rem;
  }
  .auth-links {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
