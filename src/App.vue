<!-- src/App.vue -->
<template>
  <div id="app">
    <TaskBlueprint v-if="activeView === 'blueprint'" />
    <TaskTree v-else-if="activeView === 'tree'" />
    <TaskSummary v-else-if="activeView === 'summary'" />

    <button 
      class="view-switcher"
      @click="switchView"
    >
      {{ switchButtonText }}
    </button>
  </div>
</template>

<script>
import TaskTree from './components/task-tree/TaskTree.vue';
import TaskBlueprint from './components/task-blueprint/TaskBlueprint.vue';
import TaskSummary from './components/task-summary/TaskSummary.vue';

export default {
  name: 'App',
  components: {
    TaskTree,
    TaskBlueprint,
    TaskSummary
  },
  data() {
    return {
      activeView: 'tree',
      viewOrder: ['tree', 'blueprint', 'summary']
    }
  },
  computed: {
    switchButtonText() {
      const texts = {
        'tree': '任务树',
        'blueprint': '任务蓝图',
        'summary': '任务摘要'
      };
      return texts[this.activeView];
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeyPress);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeyPress);
  },
  methods: {
    switchView() {
      const currentIndex = this.viewOrder.indexOf(this.activeView);
      const nextIndex = (currentIndex + 1) % this.viewOrder.length;
      this.activeView = this.viewOrder[nextIndex];
    },
    handleKeyPress(event) {
      if (event.key === '1') {
        this.activeView = 'tree';
      } else if (event.key === '2') {
        this.activeView = 'blueprint';
      } else if (event.key === '3') {
        this.activeView = 'summary';
      }
    }
  }
}
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

.view-switcher {
  position: fixed;
  bottom: 0px;
  right: 0px;
  padding: 5px 5px;
  background-color: rgb(149, 226, 121);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
}

.view-switcher:hover {
  background-color: #6fcb5d;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}
</style>2