<!-- src/components/TaskSidebarNode.vue -->
<template>
  <button
    class="task-sidebar-node"
    @click.stop="$emit('locate-node', node.id)"
    :class="{ active: isActive }"
  >
    <div class="index-badge">{{ index }}</div>
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
  position: relative;
  padding: 10px 10px 10px 34px;
  margin: 0 0 4px;
  border-radius: 6px 0 0 6px;
  width: 100%;
  background-color: #bfeafe;
  border: none;
  color: #424242;
  font-weight: 320;
  text-align: left;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.index-badge {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 28px;
  background: #63b5ec;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border-radius: 4px 0 0 4px; /* 左端圆角 */
}

.task-sidebar-node:hover {
  background-color: #81d4fa;
}

.task-sidebar-node:hover .index-badge {
  background-color: #378fc5;
}
</style>