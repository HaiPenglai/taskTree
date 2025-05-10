<!-- src\components\task-tree\TaskProgressBar.vue -->
<template>
  <div class="progress-bar-container">
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
import { getFormattedTime } from "../../utils/dateTimeUtils";

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
      const end = getFormattedTime(task.startTime + task.elapsedTime * 1000); //输入毫秒格式
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

.progress-bar {
  position: relative;
  height: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: inset 0 0 3px rgba(90, 209, 248, 0.3);
  border-bottom: 1px solid #8cd7fe;
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
  transform: scale(1.1);
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
  z-index: 10000;
}
</style>