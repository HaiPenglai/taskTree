<template>
  <div class="task-summary-node" :class="{ 'completed': task.completed === 1 }">
    <div class="task-time" v-if="task.totalTime">{{ formatTime(task.totalTime) }}</div>
    <div class="task-content">
      <span v-if="task.completed === 1">✓ </span>{{ task.text }}
    </div>
  </div>
</template>

<script>
export default {
  name: "TaskSummaryNode",
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatTime(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
    }
  }
};
</script>

<style scoped>
.task-summary-node {
  background-color: #9b59b6;
  border-radius: 6px;
  padding: 3px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 150px;
  margin-right: 15px;
  transition: transform 0.3s ease;
}

.task-summary-node:hover {
  transform: translateY(-3px);
}

.task-content {
  background-color: #e8d6f0;
  padding: 10px 15px;
  border-radius: 4px;
  color: #6f3885;
  font-size: 14px;
  word-break: break-word;
}

.task-summary-node.completed {
  background-color: #27ae60;
  opacity: 0.8;
}

.task-summary-node.completed .task-content {
  background-color: #d5f5e3;
  color: #196f3d;
}

.task-time {
  color: white;
  font-size: 12px;
  text-align: center;
  padding: 2px 0;
  font-weight: 500;
}
</style>