<!-- src\components\task-blueprint\TaskBlueprintSidebarNode.vue -->
<template>
  <button
    class="task-blueprint-sidebar-node"
    @click.stop="$emit('locate-node', node.id)"
    :class="{ 
      active: isActive, 
      'snoozed': isSnoozed,
      'root-node': isRootNode 
    }"
  >
    <div 
      class="index-badge" 
      @click.stop="toggleSnooze"
      :class="{ 'root-badge': isRootNode }"
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
  computed: {
    isRootNode() {
      return !this.node.parentId;
    }
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

.task-blueprint-sidebar-node.root-node {
  background-color: #b294ff;
  color: #fff;
  font-weight: bold;
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

.root-badge {
  background: #7b54ff;
}

.task-blueprint-sidebar-node:hover {
  background-color: #d9bfff;
}

.task-blueprint-sidebar-node.root-node:hover {
  background-color: #9b78ff;
}

.task-blueprint-sidebar-node:hover .index-badge {
  background-color: #a173fc;
}

.task-blueprint-sidebar-node:hover .root-badge {
  background-color: #6842e6;
}
</style>