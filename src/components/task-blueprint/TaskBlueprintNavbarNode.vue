<!-- src/components/task-blueprint/TaskBlueprintNavbarNode.vue -->
<template>
  <button
    class="task-blueprint-navbar-node"
    @click.stop="$emit('locate-node', node.id)"
    :class="{ active: isActive }"
  >
    <div class="time-badge">
      {{ formattedTime }}
    </div>
    {{ node.text || "已完成蓝图" }}
  </button>
</template>

<script>
export default {
  name: "TaskBlueprintNavbarNode",
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
  computed: {
    formattedTime() {
      return this.node.timeStamp.split(' ')[1] || 'OK'; // 只显示时间部分
    },
  }
};
</script>

<style scoped>
.task-blueprint-navbar-node {
  position: relative;
  padding: 10px 10px 10px 8px;
  margin: 0 0 4px;
  border-radius: 0 6px 6px 0;
  width: 100%;
  background-color: #f3d4e9;
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

.time-badge {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 40px;
  background: #b4558c;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border-radius: 0 4px 4px 0;
}

.task-blueprint-navbar-node:hover {
  background-color: #f2b2db;
}

.task-blueprint-navbar-node:hover .time-badge {
  background-color: #a33581;
}
</style>