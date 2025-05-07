<!-- src/components/TaskBox.vue -->
<template>
  <div class="task-box">
    <div class="sidebar-container">
      <TaskSidebarNode
        v-for="(node, index) in pendingNodes"
        :key="node.id"
        :node="node"
        :index="index + 1"
        @locate-node="scrollToNode"
      />
    </div>
    <div class="task-tree-container">
      <TaskProgressBar :node-map="nodeMap" @locate-node="scrollToNode" />
      <TaskTreeNode
        v-for="node in nodes"
        :key="node.id"
        :node="node"
        @add-child="addChild"
        @delete-node="deleteNode"
        @move-node="moveNode"
      />
    </div>
  </div>
</template>

<script>
import TaskTreeNode from "./TaskTreeNode.vue";
import TaskSidebarNode from "./TaskSidebarNode.vue";
import TaskProgressBar from "./TaskProgressBar.vue";
import { getFormattedDate, getFormattedTime } from "../utils/dateTimeUtils";

export default {
  name: "TaskBox",
  components: {
    TaskTreeNode,
    TaskSidebarNode,
    TaskProgressBar,
  },
  data() {
    const rootId = Date.now();
    const rootNode = {
      id: rootId,
      parentId: null,
      text: ``,
      estimatedTime: 90,
      remainingTime: 90 * 60,
      startTime: 0,
      elapsedTime: 0,
      completed: 0,
      timeStamp: getFormattedDate(),
      children: [],
    };

    return {
      nodes: [rootNode],
      nodeMap: { [rootId]: rootNode },
    };
  },
  computed: {
    pendingNodes() {
      // 获取所有未完成节点并按estimatedTime排序
      return Object.values(this.nodeMap)
        .filter((node) => node.completed === 0)
        .sort((a, b) => a.estimatedTime - b.estimatedTime);
    },
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
        startTime: 0,
        elapsedTime: 0,
        completed: 0,
        timeStamp: getFormattedTime(),
        children: [],
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

    scrollToNode(nodeId) {
      const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
      if (nodeElement) {
        document.querySelectorAll(".highlight").forEach((el) => {
          el.classList.remove("highlight");
        });
        nodeElement.scrollIntoView({ behavior: "smooth", block: "center" });
        nodeElement.classList.add("highlight");
        setTimeout(() => {
          nodeElement.classList.remove("highlight");
        }, 3000);
      }
    },
  },
};
</script>

<style scoped>
.task-box {
  display: flex;
  gap: 20px;
  height: 100%;
}

.sidebar-container {
  width: 250px;
  background-color: white;
  border-right: 2px solid #1aa3a5;
  overflow-y: auto;
  max-height: 100vh;
}

.task-tree-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
  overflow-y: auto;
  max-height: 100vh;
}
</style>

