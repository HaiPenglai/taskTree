<!-- src\components\task-tree\TaskTreeSidebarNode.vue -->
<template>
  <button
    class="task-sidebar-node"
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
    {{ node.text || "开始构思任务" }}
  </button>
</template>
  
<script>
export default {
  name: "TaskTreeSidebarNode",
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
.task-sidebar-node {
  position: relative;
  padding: 10px 10px 10px 34px;
  margin: 0 0 4px;
  border-radius: 6px 0 0 6px;
  width: 100%;
  background-color: #bfeafe;
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

.task-sidebar-node.root-node {
  background-color: #73b9e6;
  color: #fff;
  font-weight: bold;
}

.task-sidebar-node.snoozed {
  opacity: 0.5;
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
  border-radius: 4px 0 0 4px;
  cursor: pointer;
}

.root-badge {
  background: #1a6fb5;
}

.task-sidebar-node:hover {
  background-color: #81d4fa;
}

.task-sidebar-node.root-node:hover {
  background-color: #4a9bd9;
}

.task-sidebar-node:hover .index-badge {
  background-color: #378fc5;
}

.task-sidebar-node:hover .root-badge {
  background-color: #0e5a96;
}
</style>