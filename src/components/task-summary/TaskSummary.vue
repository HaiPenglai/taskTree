<template>
  <div class="task-summary-container">
    <div class="loading-text" v-if="loadError != null">
      {{ loadError }}
    </div>

    <div class="content-wrapper">
      <TaskSummarySidebar 
        :summaryData="summaryData" 
        :activeDate="activeDate"
        :timesByDate="timesByDate"
        @locate-day="scrollToDay" 
      />
      
      <div class="summary-container" ref="summaryContainer" @scroll="handleScroll">
        <div 
          v-for="date in sortedDates" 
          :key="date" 
          class="day-container"
          :id="'day-' + date"
          :ref="el => { if (el) dayRefs[date] = el }"
        >
          <div class="date-header">
            {{ date }} 
            <span v-if="timesByDate[date]">{{ formatTotalTime(timesByDate[date]) }}</span>
          </div>
          <div class="tasks-row">
            <TaskSummaryNode 
              v-for="task in summaryData[date]" 
              :key="task.id" 
              :task="task" 
              :totalTime="timesByDate[date]"
            />
          </div>
        </div>
        <div v-if="isLoading" class="loading-more">加载更多...</div>
        <div v-if="!hasMore && sortedDates.length > 0" class="no-more-data">没有更多数据了</div>
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
      summaryData: {},
      timesByDate: {},
      userId: this.getCurrentUserId(),
      loadError: null,
      activeDate: '',
      dayRefs: {},
      currentPage: 1,
      hasMore: true,
      isLoading: false
    };
  },
  computed: {
    sortedDates() {
      return Object.keys(this.summaryData).sort().reverse();
    }
  },
  async created() {
    await this.loadTaskSummary();
    // 如果有数据，默认选中第一个日期
    if (this.sortedDates.length > 0) {
      this.activeDate = this.sortedDates[0];
    }
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
    async loadTaskSummary(page = 1) {
      if (page === 1) {
        this.loadError = "Loading...";
      }
      
      if (this.isLoading || (!this.hasMore && page > 1)) {
        return;
      }
      
      this.isLoading = true;
      
      try {
        const response = await this.$axios.get(
          `/api/task-summary/${this.userId}?page=${page}`
        );
        
        if (response.data && response.data.summariesByDate) {
          if (page === 1) {
            this.summaryData = response.data.summariesByDate;
            this.timesByDate = response.data.timesByDate;
          } else {
            // 合并新数据
            this.summaryData = {
              ...this.summaryData,
              ...response.data.summariesByDate
            };
            this.timesByDate = {
              ...this.timesByDate,
              ...response.data.timesByDate
            };
          }
          
          // 更新分页信息
          this.hasMore = response.data.pagination.hasMore;
          this.currentPage = response.data.pagination.page;
        }
        
        this.loadError = null;
      } catch (error) {
        this.loadError = "加载任务摘要失败，将使用默认摘要";
        console.error("Error loading task summary:", error);
      } finally {
        this.isLoading = false;
      }
    },
    scrollToDay(date) {
      this.activeDate = date;
      
      const element = this.dayRefs[date];
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        
        // 添加高亮效果
        element.classList.add("highlight");
        setTimeout(() => {
          element.classList.remove("highlight");
        }, 2000);
      }
    },
    formatTotalTime(seconds) {
      if (!seconds) return '';
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}:${minutes.toString().padStart(2, '0')}`;
    },
    handleScroll(event) {
      const container = event.target;
      const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      
      // 当滚动到距离底部100px时加载更多
      if (scrollBottom < 100 && !this.isLoading && this.hasMore) {
        this.loadTaskSummary(this.currentPage + 1);
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
  transition: background-color 0.3s ease;
}

.day-container.highlight {
  background-color: rgba(155, 89, 182, 0.25);
  border-radius: 8px;
}

.date-header {
  font-size: 18px;
  font-weight: bold;
  color: #6a3093;
  margin-bottom: 15px;
  padding-bottom: 5px;
  border-bottom: 2px solid #a569bd;
}

.date-header span {
  margin-left: 15px;
  font-size: 16px;
}

.tasks-row {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.loading-text {
  color: #424242;
  padding: 20px;
  text-align: center;
}

.loading-more {
  text-align: center;
  padding: 20px;
  color: #6a3093;
  font-size: 14px;
}

.no-more-data {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
  font-style: italic;
}
</style>