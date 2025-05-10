<!-- src\components\task-blueprint\TaskBlueprintSidebarNode.vue -->
<template>
  <button
    class="task-blueprint-sidebar-node"
    @click.stop="$emit('locate-node', node.id)"
    :class="{ active: isActive, 'snoozed': isSnoozed }"
  >
    <div 
      class="index-badge" 
      @click.stop="toggleSnooze"
    >
      {{ index }}
    </div>
    {{ node.text || "开始规划蓝图" }}
  </button>
</template>
  
<script>
export default {
  name: "TaskBlueprintSidebarNode",
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
  data() {
    return {
      isSnoozed: false
    };
  },
  methods: {
    toggleSnooze() {
      this.isSnoozed = !this.isSnoozed;
    }
  }
};
</script>
  
<style scoped>
.task-blueprint-sidebar-node {
  position: relative;
  padding: 10px 10px 10px 34px;
  margin: 0 0 4px;
  border-radius: 6px 0 0 6px;
  width: 100%;
  background-color: #e8d4ff;
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

.task-blueprint-sidebar-node.snoozed {
  opacity: 0.5;
}

.index-badge {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 28px;
  background: #a292ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border-radius: 4px 0 0 4px;
  cursor: pointer;
}

.task-blueprint-sidebar-node:hover {
  background-color: #d9bfff;
}

.task-blueprint-sidebar-node:hover .index-badge {
  background-color: #a173fc;
}
</style>