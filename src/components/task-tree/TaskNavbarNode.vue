<!-- src\components\task-tree\TaskNavbarNode.vue -->
<template>
  <button
    class="task-navbar-node"
    @click.stop="$emit('locate-node', node.id)"
    :class="{ active: isActive, 'snoozed': isSnoozed }"
  >
    <div 
      class="time-badge" 
      @click.stop="toggleSnooze"
    >
      {{ formattedTime }}
    </div>
    {{ node.text || "未命名" }}
  </button>
</template>

<script>
import { getFormattedTime } from "../../utils/dateTimeUtils";

export default {
  name: "TaskNavbarNode",
  props: {
    node: {
      type: Object,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isSnoozed: false
    };
  },
  computed: {
    formattedTime() {
      const minutes = Math.floor(this.node.remainingTime / 60);
      const seconds = this.node.remainingTime % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },
  },
  methods: {
    toggleSnooze() {
      this.isSnoozed = !this.isSnoozed;
    }
  }
};
</script>

<style scoped>
.task-navbar-node {
  position: relative;
  padding: 10px 10px 10px 8px;
  margin: 0 0 4px;
  border-radius: 0 6px 6px 0;
  width: 100%;
  background-color: #d4f3f0;
  border: none;
  color: #424242;
  text-align: left;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-navbar-node.snoozed {
  opacity: 0.5;
}

.time-badge {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 40px;
  background: #4db6ac;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.task-navbar-node:hover {
  background-color: #b2ebf2;
}

.task-navbar-node:hover .time-badge {
  background-color: #26a69a;
}
</style>