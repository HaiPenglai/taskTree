<!-- src\components\TaskTree.vue -->
<template>
    <div class="task-tree">
      <TaskTreeNode 
        v-for="node in nodes" 
        :key="node.id" 
        :node="node" 
        @add-child="addChild"
      />
    </div>
  </template>
  
  <script>
  import TaskTreeNode from './TaskTreeNode.vue'
  
  export default {
    name: 'TaskTree',
    components: {
      TaskTreeNode
    },
    data() {
      return {
        nodes: [
          {
            id: 1,
            text: '根任务',
            children: []
          }
        ]
      }
    },
    methods: {
      addChild(parentId) {
        const newNodeId = Date.now() // 使用时间戳作为简单ID
        const newNode = {
          id: newNodeId,
          text: `新任务 ${newNodeId}`,
          children: []
        }
        
        this.findNodeAndAddChild(this.nodes, parentId, newNode)
      },
      findNodeAndAddChild(nodes, parentId, newNode) {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === parentId) {
            nodes[i].children.push(newNode)
            return true
          }
          if (nodes[i].children && nodes[i].children.length > 0) {
            if (this.findNodeAndAddChild(nodes[i].children, parentId, newNode)) {
              return true
            }
          }
        }
        return false
      }
    }
  }
  </script>
  
  <style scoped>
  .task-tree {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  </style>
  