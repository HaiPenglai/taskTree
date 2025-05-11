<template>
  <div class="sidebar-container">
    <div 
      v-for="(tasks, date) in summaryData" 
      :key="date" 
      class="sidebar-item"
      @click="$emit('locate-day', date)"
    >
      <div class="sidebar-date">{{ date }}</div>
      <div class="sidebar-text">
        {{ tasks[0]?.text || "无任务" }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TaskSummarySidebar",
  props: {
    summaryData: {
      type: Object,
      required: true
    }
  },
  emits: ['locate-day']
};
</script>

<style scoped>
.sidebar-container {
  width: 250px;
  background-color: white;
  border-right: 2px solid #9b59b6;
  overflow-y: auto;
  padding: 10px 0;
}

.sidebar-item {
  padding: 12px 15px;
  margin: 0 10px 10px;
  background-color: #f5eef8;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sidebar-item:hover {
  background-color: #e8d6f0;
  transform: translateX(5px);
}

.sidebar-date {
  font-size: 14px;
  font-weight: bold;
  color: #6a3093;
  margin-bottom: 5px;
}

.sidebar-text {
  font-size: 13px;
  color: #4a235a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>