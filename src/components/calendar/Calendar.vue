<!-- src/components/calendar/Calendar.vue -->
<template>
  <div class="calendar-container" v-show="visible">
    <div class="calendar">
      <button class="delete-button" @click="$emit('update:visible', false)">
        <span class="delete-icon">×</span>
      </button>
      <div class="calendar-header">
        <div class="header-left">
          <div class="date-display">{{ currentDate }}</div>
          <button class="add-button" @click="addNode">+</button>
        </div>
      </div>
      <div class="calendar-content">
        <CalendarNode
          v-for="node in sortedNodes"
          :key="node.id"
          :node="node"
          :class="node.isTriggered ? 'active' : ''"
          @delete-node="deleteNode"
        />
      </div>
    </div>
  </div>
</template>

<script>
import CalendarNode from "./CalendarNode.vue";
import axios from "axios";

export default {
  name: "Calendar",
  components: {
    CalendarNode,
  },
  props: {
    userId: {
      type: Number,
      required: true,
    },
    visible: {
      type: Boolean,
      default: false,
    },
    selectedDate: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      calendarNodes: [
        {
          id: Date.now(),
          time: "22:50",
          text: "早睡",
          isTriggered: false,
          isCompleted: false,
        },
      ],
      checkInterval: null,
    };
  },
  computed: {
    currentDate() {
      const [year, month, day] = this.selectedDate.split('-');
      return `${year}年${parseInt(month)}月${parseInt(day)}日`;
    },
    sortedNodes() {
      return [...this.calendarNodes].sort((a, b) => {
        // 触发的放在最前面
        if (a.isTriggered && !b.isTriggered) return -1;
        if (!a.isTriggered && b.isTriggered) return 1;
        
        // 其他按时间排序
        return new Date(a.time) - new Date(b.time);
      });
    },
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.loadCalendar();
        this.startChecking();
      } else {
        this.stopChecking();
      }
    },
    currentDate() {
      this.$emit('update:visible', false);
    },
  },
  methods: {
    async loadCalendar() {
      try {
        const response = await axios.get(`/api/calendar/${this.userId}`);
        if (response.data.success) {
          this.calendarNodes = response.data.calendarNodes;
        }
      } catch (error) {
        console.error("加载日历失败:", error);
      }
    },
    async saveCalendar() {
      try {
        await axios.post(`/api/calendar/${this.userId}`, {
          calendarNodes: this.calendarNodes,
        });
      } catch (error) {
        console.error("保存日历失败:", error);
      }
    },
    addNode() {
      const now = new Date();
      // 设置为当前时间后一小时
      now.setHours(now.getHours() + 1);
      const newNode = {
        id: Date.now(),
        time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        text: "",
        isTriggered: false,
        isCompleted: false,
      };
      this.calendarNodes.push(newNode);
      this.saveCalendar();
    },
    deleteNode(nodeId) {
      const index = this.calendarNodes.findIndex((node) => node.id === nodeId);
      if (index !== -1) {
        this.calendarNodes.splice(index, 1);
        this.saveCalendar();
      }
    },
    checkTriggers() {
      const now = new Date();
      const currentTime = `${now.getHours()}:${
        now.getMinutes() < 10 ? "0" : ""
      }${now.getMinutes()}`;

      this.calendarNodes.forEach((node) => {
        if (!node.isTriggered && node.time <= currentTime) {
          node.isTriggered = true;
          this.$emit("trigger-calendar", node);
        }
      });
      
      this.saveCalendar();
    },
    startChecking() {
      this.checkInterval = setInterval(this.checkTriggers, 60000); // 每分钟检查一次
      this.checkTriggers(); // 立即检查一次
    },
    stopChecking() {
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
        this.checkInterval = null;
      }
    },
  },
  beforeUnmount() {
    this.stopChecking();
  },
};
</script>

<style scoped>
.calendar-container {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 2000;
}

.calendar {
  position: relative;
  background-color: #fff5e6;
  border-radius: 8px;
  padding: 16px;
  width: 420px;
  min-width: 420px;
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.delete-button {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 22px;
  height: 22px;
  border-bottom-left-radius: 100%;
  background-color: #9e9e9e;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  z-index: 1;
  transition: all 0.2s ease;
}

.delete-button:hover {
  background-color: #f44336;
  transform: scale(1.1);
}

.delete-icon {
  line-height: 1;
  margin-top: -2px;
}

.calendar-header {
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #ffb366;
  padding-right: 16px;
  margin-top: 8px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-display {
  font-size: 16px;
  font-weight: bold;
  color: #ff8c00;
}

.add-button {
  background: #ff8c00;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  margin-left: 4px;
}

.add-button:hover {
  background: #ff6b00;
}

.calendar-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  min-width: 0;
}

.calendar-node {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  background-color: #fff0e0;
  border-radius: 4px;
  padding: 8px;
  transition: all 0.3s ease;
}

.calendar-node.active {
  background-color: #ffb366;
  color: white;
  font-weight: bold;
}
</style> 