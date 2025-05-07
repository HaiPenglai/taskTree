<!-- src/components/TaskSidebarNode.vue -->
<template>
  <button
    class="task-sidebar-node"
    @click.stop="$emit('locate-node', node.id)"
    :class="{ active: isActive }"
  >
    <span class="node-index">{{ index }}.</span>
    {{ node.text || "未命名" }}
  </button>
</template>
  
  <script>
export default {
  name: "TaskSidebarNode",
  props: {
    node: {
      type: Object,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    index: {
      type: Number,
      required: true,
    },
  },
};
</script>
  
  <style scoped>
.task-sidebar-node {
  display: block;
  width: 100%;
  padding: 10px 8px;
  margin: 0px 0 4px 0;
  background-color: #bfeafe;
  border: none;
  border-radius: 4px;
  color: #525252; /* 深灰色文字 */
  font-weight: 350;
  text-align: left;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-index {
  color: white;
  font-weight: bold;
  flex-shrink: 0;
}

.task-sidebar-node:hover {
  background-color: #81d4fa; /* 悬停时稍深 */
}

.task-sidebar-node.active {
  background-color: #4fc3f7; /* 点击/激活时更深 */
  color: white;
}
</style>