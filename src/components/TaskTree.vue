<!-- src\components\TaskTree.vue -->
<template>
  <div class="task-tree">
    <TaskTreeNode
      v-for="node in nodes"
      :key="node.id"
      :node="node"
      @add-child="addChild"
      @delete-node="deleteNode"
      @move-node="moveNode"
    />
  </div>
</template>
  
  <script>
import TaskTreeNode from "./TaskTreeNode.vue";
import { getFormattedDate, getFormattedTime } from "../utils/dateTimeUtils";

export default {
  name: "TaskTree",
  components: {
    TaskTreeNode,
  },
  data() {
    const rootId = Date.now();
    const rootNode = {
      id: rootId,
      parentId: null,
      text: ``,
      estimatedTime: 60 * 6,
      remainingTime: 60 * 6 * 60,
      completed: 0,
      actualTime: 0,
      timeStamp: getFormattedDate(),
      children: [],
    };

    return {
      nodes: [rootNode],
      nodeMap: { [rootId]: rootNode },
    };
  },
  methods: {
    addChild(parentId) {
      const newNodeId = Date.now();
      const newNode = {
        id: newNodeId,
        parentId: parentId,
        text: ``,
        estimatedTime: 5,
        remainingTime: 5 * 60,
        completed: 0,
        actualTime: 0,
        children: [],
        timeStamp: getFormattedTime(),
      };

      const parentNode = this.nodeMap[parentId];
      if (parentNode) {
        parentNode.children.push(newNode);
        this.nodeMap[newNodeId] = newNode;
      }
    },
    deleteNode(nodeId) {
      const nodeToDelete = this.nodeMap[nodeId];
      if (!nodeToDelete) return;

      if (nodeToDelete.parentId === null) {
        nodeToDelete.children = [];
        return;
      }

      const parentNode = this.nodeMap[nodeToDelete.parentId];
      if (parentNode) {
        const index = parentNode.children.findIndex(
          (child) => child.id === nodeId
        );
        if (index !== -1) {
          parentNode.children.splice(index, 1);
        }
      }

      const removeFromMap = (node) => {
        node.children.forEach((child) => removeFromMap(child));
        delete this.nodeMap[node.id];
      };
      removeFromMap(nodeToDelete);
    },
    moveNode({ nodeId, direction }) {
      const node = this.nodeMap[nodeId];
      if (!node || node.parentId === null) return;

      const parent = this.nodeMap[node.parentId];
      if (!parent || !parent.children) return;

      const siblings = parent.children;
      const currentIndex = siblings.findIndex((n) => n.id === nodeId);

      if (currentIndex === -1) return;

      let newIndex;
      if (direction > 0) {
        newIndex = currentIndex + 1;
        if (newIndex >= siblings.length) {
          newIndex = 0;
        }
      } else {
        newIndex = currentIndex - 1;
        if (newIndex < 0) {
          newIndex = siblings.length - 1;
        }
      }
      [siblings[currentIndex], siblings[newIndex]] = [
        siblings[newIndex],
        siblings[currentIndex],
      ];
    },
  },
};
</script>
  
  <style scoped>
.task-tree {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
  