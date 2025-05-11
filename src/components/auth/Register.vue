<!-- src/components/auth/Register.vue -->
<template>
  <div class="auth-container">
    <div class="auth-form">
      <h2>注册</h2>
      <div class="form-group">
        <input 
          type="text" 
          v-model="username" 
          placeholder="用户名" 
        />
      </div>
      <div class="form-group">
        <input 
          type="password" 
          v-model="password" 
          placeholder="密码" 
        />
      </div>
      <div class="form-group">
        <input 
          type="password" 
          v-model="confirmPassword" 
          placeholder="确认密码" 
        />
      </div>
      <div class="form-group">
        <input 
          type="text" 
          v-model="nickname" 
          placeholder="昵称（可选）" 
        />
      </div>
      <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
      <div class="form-actions">
        <button @click="register" :disabled="isLoading">
          {{ isLoading ? '注册中...' : '注册' }}
        </button>
        <a href="#" @click.prevent="$emit('switch-mode', 'login')">返回登录</a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Register",
  data() {
    return {
      username: "",
      password: "",
      confirmPassword: "",
      nickname: "",
      errorMessage: "",
      isLoading: false
    };
  },
  emits: ['register-success', 'switch-mode'],
  methods: {
    async register() {
      if (!this.username || !this.password) {
        this.errorMessage = "请输入用户名和密码";
        return;
      }

      if (this.password !== this.confirmPassword) {
        this.errorMessage = "两次输入的密码不一致";
        return;
      }

      this.isLoading = true;
      this.errorMessage = "";

      try {
        const response = await this.$axios.post('/api/auth/register', {
          username: this.username,
          password: this.password,
          nickname: this.nickname
        });

        if (response.data.success) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          this.$emit('register-success', response.data.user);
        } else {
          this.errorMessage = response.data.message || "注册失败";
        }
      } catch (error) {
        if (error.response && error.response.data) {
          this.errorMessage = error.response.data.message;
        } else {
          this.errorMessage = "注册请求失败，请检查网络连接";
        }
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #fff8e1;
}

.auth-form {
  width: 320px;
  background-color: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 14px;
}

input:focus {
  outline: none;
  border-color: #9c64ff;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

button {
  background-color: #9c64ff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 15px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #8a4dff;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

a {
  color: #9c64ff;
  text-decoration: none;
  font-size: 14px;
}

a:hover {
  text-decoration: underline;
}

.error-message {
  color: #f46f99;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
}
</style> 