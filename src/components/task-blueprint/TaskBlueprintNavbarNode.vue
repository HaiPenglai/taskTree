<!-- src/components/task-blueprint/TaskBlueprintNavbarNode.vue -->
<template>
  <button
    class="task-blueprint-navbar-node"
    @click.stop="handleClick"
    :class="{ active: isActive }"
  >
    <div 
      class="time-badge"
      :class="{ active: isActive }"
    >
      {{ formattedTime }}
      <span class="time-number" v-if="index">{{ index }}</span>
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
    index: {
      type: Number,
      default: null
    }
  },
  computed: {
    formattedTime() {
      return this.node.timeStamp.split(' ')[1] || 'OK'; // 只显示时间部分
    }
  },
  methods: {
    handleClick() {
      this.$emit('click-node', this.node.id);
    }
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

.task-blueprint-navbar-node.active {
  background-color: #f282c2;
  color: #fff;
  font-weight: bold;
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

.time-badge.active {
  background: #a33581;
}

.task-blueprint-navbar-node:hover {
  background-color: #f2b2db;
}

.task-blueprint-navbar-node.active:hover {
  background-color: #e56fb4;
}

.task-blueprint-navbar-node:hover .time-badge {
  background-color: #a33581;
}

.task-blueprint-navbar-node.active:hover .time-badge {
  background-color: #8e2971;
}

.time-number {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 10px;
  line-height: 1;
}
</style>