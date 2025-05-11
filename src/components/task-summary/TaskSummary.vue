<template>
  <div class="task-summary-container">
    <div class="loading-text" v-if="loadError != null">
      {{ loadError }}
    </div>

    <div class="content-wrapper">
      <TaskSummarySidebar :summaryData="summaryData" @locate-day="scrollToDay" />
      
      <div class="summary-container">
        <div 
          v-for="(tasks, date) in summaryData" 
          :key="date" 
          class="day-container"
          :id="`day-${date}`"
        >
          <div class="date-header">{{ date }}</div>
          <div class="tasks-row">
            <TaskSummaryNode 
              v-for="task in tasks" 
              :key="task.id" 
              :task="task" 
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TaskSummaryNode from "./TaskSummaryNode.vue";
import TaskSummarySidebar from "./TaskSummarySidebar.vue";

export default {
  name: "TaskSummary",
  components: {
    TaskSummaryNode,
    TaskSummarySidebar,
  },
  data() {
    return {
      summaryData: [],
      userId: this.getCurrentUserId(),
      loadError: null,
    };
  },
  async created() {
    await this.loadTaskSummary();
  },
  methods: {
    getCurrentUserId() {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          return user.id;
        } catch (e) {
          return 1;
        }
      }
      return 1;
    },
    async loadTaskSummary() {
      this.loadError = "Loading...";
      try {
        const response = await this.$axios.get(
          `/api/task-summary/${this.userId}`
        );
        this.summaryData = response.data;
        this.loadError = null;
      } catch (error) {
        this.loadError = "加载任务摘要失败，将使用默认摘要";
        console.error("Error loading task summary:", error);
      }
    },
    scrollToDay(date) {
      const element = document.getElementById(`day-${date}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }
};
</script>

<style scoped>
.task-summary-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.content-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.summary-container {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
}

.day-container {
  margin-bottom: 30px;
}

.date-header {
  font-size: 18px;
  font-weight: bold;
  color: #6a3093;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 2px solid #a569bd;
}

.tasks-row {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.loading-text {
  color: #424242;
}
</style>