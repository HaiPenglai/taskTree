<template>
  <div class="task-summary-node">
    <div class="task-content">
      {{ task.text }}
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
}

.task-content {
  background-color: #e8d6f0;
  padding: 10px 15px;
  border-radius: 4px;
  color: #4a235a;
  font-size: 14px;
  word-break: break-word;
}
</style>