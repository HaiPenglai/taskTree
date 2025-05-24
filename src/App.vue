<!-- src/App.vue -->
<template>
  <div id="app">
    <Auth v-if="!isAuthenticated" @auth-success="handleAuthSuccess" />
    
    <template v-else>
      <TaskBlueprint v-if="activeView === 'blueprint'" />
      <TaskTree v-else-if="activeView === 'tree'" />
      <TaskSummary v-else-if="activeView === 'summary'" />

      <div class="app-controls">
        <button 
          class="view-button tree-button" 
          :class="{ active: activeView === 'tree' }"
          @click="setView('tree')"
        >
          任务树
        </button>
        <button 
          class="view-button blueprint-button" 
          :class="{ active: activeView === 'blueprint' }"
          @click="setView('blueprint')"
        >
          任务蓝图
        </button>
        <button 
          class="view-button summary-button" 
          :class="{ active: activeView === 'summary' }"
          @click="setView('summary')"
        >
          任务摘要
        </button>
        
        <button class="logout-button" @click="logout">
          退出 ({{ currentUser.nickname || currentUser.username }})
        </button>
      </div>
    </template>
  </div>
</template>

<script>
import TaskTree from "./components/task-tree/TaskTree.vue";
import TaskBlueprint from "./components/task-blueprint/TaskBlueprint.vue";
import TaskSummary from "./components/task-summary/TaskSummary.vue";
import Auth from "./components/auth/Auth.vue";

export default {
  name: "App",
  components: {
    TaskTree,
    TaskBlueprint,
    TaskSummary,
    Auth
  },
  data() {
    return {
      activeView: "tree",
      viewOrder: ["tree", "blueprint", "summary"],
      isAuthenticated: false,
      currentUser: null
    };
  },
  created() {
    // 检查本地存储中是否有用户信息
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
        this.isAuthenticated = true;
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  },
  computed: {
    switchButtonText() {
      const texts = {
        tree: "任务树",
        blueprint: "任务蓝图",
        summary: "任务摘要",
      };
      return texts[this.activeView];
    },
  },
  mounted() {
    window.addEventListener("keydown", this.handleKeyPress);
  },
  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeyPress);
  },
  methods: {
    setView(view) {
      this.activeView = view;
    },
    handleKeyPress(event) {
      if (event.key === "F2" && this.isAuthenticated) {
        const currentIndex = this.viewOrder.indexOf(this.activeView);
        const nextIndex = (currentIndex + 1) % this.viewOrder.length;
        this.activeView = this.viewOrder[nextIndex];
      }
    },
    handleAuthSuccess(user) {
      this.currentUser = user;
      this.isAuthenticated = true;
    },
    logout() {
      this.isAuthenticated = false;
      this.currentUser = null;
      localStorage.removeItem('user');
    }
  },
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
  background: #fff8e1;
  font-family: Arial;
  height: 100vh;
  overflow: hidden;
}

.app-controls {
  position: fixed;
  bottom: 0;
  right: 0;
  display: flex;
  gap: 10px;
  /* padding: 10px; */
}

.view-button {
  padding: 5px 10px;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.view-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.tree-button {
  background-color: rgb(149, 226, 121);
}

.tree-button:hover {
  background-color: #6fcb5d;
}

.tree-button.active {
  background-color: #4caf50;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.blueprint-button {
  background-color: #87ceeb;
}

.blueprint-button:hover {
  background-color: #5f9eb3;
}

.blueprint-button.active {
  background-color: #4682b4;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.summary-button {
  background-color: #d29fd2;
}

.summary-button:hover {
  background-color: #a086d0;
}

.summary-button.active {
  background-color: #9370db;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.logout-button {
  padding: 5px 10px;
  background-color: #f46f99;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.logout-button:hover {
  background-color: #e45a86;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>