<!-- src/components/TaskProgressBar.vue -->
<template>
  <div class="progress-bar-container">
    <div class="time-indicators">
      <span v-for="hour in 24" :key="hour" class="time-indicator">
        {{ hour - 1 }}
      </span>
    </div>
    <div class="progress-bar">
      <div
        v-for="task in activeTasks"
        :key="task.id"
        class="task-segment"
        :style="getTaskSegmentStyle(task)"
        @click="handleTaskClick(task.id)"
        @mouseover="hoveredTaskId = task.id"
        @mouseleave="hoveredTaskId = null"
        :title="getTaskTooltip(task)"
      >
        <div class="task-label" v-if="hoveredTaskId === task.id">
          {{ truncateText(task.text || "未命名", 15) }}
        </div>
      </div>
    </div>
  </div>
</template>
  
  <script>
import { getFormattedTime } from "../utils/dateTimeUtils";

export default {
  name: "TaskProgressBar",
  props: {
    nodeMap: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      hoveredTaskId: null,
    };
  },
  computed: {
    activeTasks() {
      return Object.values(this.nodeMap).filter(
        (node) => node.elapsedTime > 0 && node.startTime > 0
      );
    },
  },
  methods: {
    timeToMinutes(timeStr) {
      if (!timeStr) return 0;
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    },

    getTaskSegmentStyle(task) {
      const startTime = this.timeToMinutes(getFormattedTime(task.startTime));
      const endTime = startTime + Math.floor(task.elapsedTime / 60);

      const startPercent = (startTime / 1440) * 100;
      const endPercent = (endTime / 1440) * 100;
      const widthPercent = endPercent - startPercent;

      return {
        left: `${startPercent}%`,
        width: `${widthPercent}%`,
        backgroundColor: this.getTaskColor(task),
      };
    },

    getTaskColor(task) {
      if (task.completed == 1) return "#77DD77";
      else if(task.completed == -1) return "#FFD8B1";
      return "#7BBEFF";
    },

    getTaskTooltip(task) {
      const start = getFormattedTime(task.startTime);
      const end = getFormattedTime(task.startTime + task.elapsedTime);
      return `${
        task.text || "未命名"
      }\n${start} - ${end}\n已进行: ${Math.floor(task.elapsedTime / 60)}分钟`;
    },

    handleTaskClick(nodeId) {
      this.$emit("locate-node", nodeId);
    },
    truncateText(text, maxLength) {
      if (!text) return "未命名";
      return text.length > maxLength
        ? text.substring(0, maxLength) + "..."
        : text;
    },
  },
};
</script>
  
  <style scoped>
.progress-bar-container {
  width: 100%;
  padding: 0;
  background: transparent;
  border-radius: 4px;
  margin-bottom: 0;
}

.time-indicators {
  display: flex;
  justify-content: space-between;
  font-size: 6px;
  color: #666;
  margin-bottom: 0;
}

.time-indicator {
  flex: 1;
  text-align: center;
}

.progress-bar {
  position: relative;
  height: 20px;
  background-color: white;
  clip-path: polygon(
    0 10px,        
    10px 0,        
    calc(100% - 10px) 0,  
    100% 10px,     
    100% calc(100% - 10px), 
    calc(100% - 10px) 100%, 
    10px 100%,     
    0 calc(100% - 10px)
  );
  box-shadow: inset 0 0 3px rgba(90, 209, 248, 0.3);
}

.task-segment {
  position: absolute;
  height: 100%;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 2px;
}

.task-segment:hover {
  opacity: 0.8;
  transform: scaleY(1.1);
}

.task-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  white-space: nowrap;
  z-index: 10;
}
</style>