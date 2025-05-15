<!-- src/components/task-tree/TaskTreeOKNode.vue -->
<template>
  <button
    class="task-ok-node"
    @click.stop="$emit('locate-node', node.id)"
    :class="{ 'root-node': isRootNode }"
  >
    {{ node.text || "已完成任务" }}
    <div 
      class="ok-badge"
      :class="{ 'root-badge': isRootNode }"
    >
      OK
      <span class="ok-number" v-if="index">{{ index }}</span>
    </div>
  </button>
</template>

<script>
export default {
  name: "TaskTreeOKNode",
  props: {
    node: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      default: null
    }
  },
  computed: {
    isRootNode() {
      return !this.node.parentId;
    }
  }
};
</script>

<style scoped>
.task-ok-node {
  position: relative;
  padding: 10px 40px 10px 10px;
  margin: 0 0 4px;
  border-radius: 0 6px 6px 0;
  width: 100%;
  background-color: #d7fbe5;
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

.task-ok-node.root-node {
  background-color: #90edb0;
  color: white;
  font-weight: bold;
}

.ok-badge {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 40px;
  background: #4dfb70;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border-radius: 0 4px 4px 0;
}

.root-badge {
  background: #2cc65a;
}

.task-ok-node:hover {
  background-color: #bfffd9;
}

.task-ok-node.root-node:hover {
  background-color: #6dda92;
}

.task-ok-node:hover .ok-badge {
  background-color: #2cc65a;
}

.task-ok-node:hover .root-badge {
  background-color: #1e9e46;
}

.ok-number {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 10px;
  line-height: 1;
}
</style>