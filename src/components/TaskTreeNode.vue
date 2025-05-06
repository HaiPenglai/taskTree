<!-- src\components\TaskTreeNode.vue -->
<template>
    <div class="task-tree-node">
      <div class="node-content">
        <div class="node-text">{{ node.text }}</div>
        <button class="add-button" @click.stop="addChild">+</button>
      </div>
      
      <div class="children" v-if="node.children && node.children.length > 0">
        <div class="connector"></div>
        <div class="children-nodes">
          <TaskTreeNode 
            v-for="child in node.children" 
            :key="child.id" 
            :node="child" 
            @add-child="$emit('add-child', $event)"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'TaskTreeNode',
    props: {
      node: {
        type: Object,
        required: true
      }
    },
    methods: {
      addChild() {
        this.$emit('add-child', this.node.id)
      }
    }
  }
  </script>
  
  <style scoped>
  .task-tree-node {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .node-content {
    display: flex;
    align-items: center;
    gap: 10px;
    background-color: #a8e6a8; /* 浅绿色 */
    padding: 8px 12px;
    border-radius: 4px;
    width: fit-content;
    position: relative;
  }
  
  .node-text {
    flex-grow: 1;
  }
  
  .add-button {
    background: #4caf50;
    color: white;
    border: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }
  
  .add-button:hover {
    background: #3e8e41;
  }
  
  .children {
    display: flex;
    margin-left: 20px;
    position: relative;
  }
  
  .connector {
    position: absolute;
    left: -20px;
    top: -10px;
    width: 20px;
    height: 100%;
    border-left: 2px solid #999;
    border-bottom: 1px solid #999;
    border-bottom-left-radius: 8px;
  }
  
  .children-nodes {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-left: 20px;
  }
  </style>