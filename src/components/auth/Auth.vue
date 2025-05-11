<!-- src/components/auth/Auth.vue -->
<template>
  <div class="auth-wrapper">
    <Login 
      v-if="currentMode === 'login'"
      @login-success="handleAuthSuccess"
      @switch-mode="switchMode"
    />
    <Register
      v-else-if="currentMode === 'register'"
      @register-success="handleAuthSuccess"
      @switch-mode="switchMode"
    />
  </div>
</template>

<script>
import Login from './Login.vue';
import Register from './Register.vue';

export default {
  name: "Auth",
  components: {
    Login,
    Register
  },
  data() {
    return {
      currentMode: 'login'
    };
  },
  emits: ['auth-success'],
  methods: {
    switchMode(mode) {
      this.currentMode = mode;
    },
    handleAuthSuccess(user) {
      this.$emit('auth-success', user);
    }
  }
};
</script>

<style scoped>
.auth-wrapper {
  height: 100vh;
  width: 100%;
}
</style> 