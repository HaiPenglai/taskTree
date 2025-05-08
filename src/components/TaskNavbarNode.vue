<!-- src/components/TaskNavbarNode.vue -->
<template>
    <button
      class="task-navbar-node"
      @click.stop="$emit('locate-node', node.id)"
      :class="{ active: isActive }"
    >
      <div class="time-badge">{{ formattedTime }}</div>
      {{ node.text || "未命名" }}
    </button>
  </template>
  
  <script>
  import { getFormattedTime } from "../utils/dateTimeUtils";
  
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
    computed: {
      formattedTime() {
        const minutes = Math.floor(this.node.remainingTime / 60);
        const seconds = this.node.remainingTime % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      },
    },
  };
  </script>
  
  <style scoped>
  .task-navbar-node {
    position: relative;
    padding: 10px 10px 10px 8px;
    margin: 0 0 4px;
    border-radius: 0 6px 6px 0; /* 右端圆角 */
    width: 100%;
    background-color: #d4f3f0; /* 青色系背景 */
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
  
  .time-badge {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 40px;
    background: #4db6ac; /* 青色系徽章 */
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    border-radius: 0 4px 4px 0; /* 右端圆角 */
  }
  
  .task-navbar-node:hover {
    background-color: #b2ebf2; /* 浅青色悬停 */
  }
  
  .task-navbar-node:hover .time-badge {
    background-color: #26a69a; /* 深青色悬停 */
  }
  </style>