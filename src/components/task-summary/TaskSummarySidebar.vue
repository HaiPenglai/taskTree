<template>
  <div class="sidebar-container">
    <div 
      v-for="date in dateList" 
      :key="date" 
      class="sidebar-item"
      :class="{ active: activeDate === date }"
      @click="$emit('locate-day', date)"
    >
      <div class="sidebar-date">{{ formatDate(date) }}</div>
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
    },
    activeDate: {
      type: String,
      default: ''
    }
  },
  computed: {
    dateList() {
      return Object.keys(this.summaryData).sort().reverse();
    }
  },
  emits: ['locate-day'],
  methods: {
    formatDate(dateStr) {
      const [year, month, day] = dateStr.split('-');
      return `${month}/${day}`;
    }
  }
};
</script>

<style scoped>
.sidebar-container {
  width: 120px;
  min-width: 120px;
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
  text-align: center;
}

.sidebar-item:hover {
  background-color: #e8d6f0;
  transform: translateX(5px);
}

.sidebar-item.active {
  background-color: #d6b7e8;
  transform: translateX(5px);
  border-left: 3px solid #8e44ad;
}

.sidebar-date {
  font-size: 16px;
  font-weight: bold;
  color: #6a3093;
}
</style>