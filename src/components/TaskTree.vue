<!-- src/components/TaskTree.vue -->
<template>
  <div class="task-container">
    <div v-if="loadingState == 0" class="loading-overlay">
      <div class="loading-spinner"></div>
      Loading...
    </div>

    <div v-if="loadError" class="error-message">
      {{ loadError }}
    </div>

    <TaskProgressBar :node-map="nodeMap" @locate-node="scrollToNode" />
    <div class="content-wrapper">
      <div class="sidebar-container">
        <TaskSidebarNode
          v-for="(node, index) in pendingNodes"
          :key="node.id"
          :node="node"
          :index="index + 1"
          @locate-node="scrollToNode"
        />
      </div>
      <div class="task-tree-container" @dblclick="handleContainerDoubleClick">
        <TaskTreeNode
          v-for="node in nodes"
          :key="node.id"
          :node="node"
          @add-child="addChild"
          @delete-node="deleteNode"
          @move-node="moveNode"
        />
      </div>
      <div class="navbar-container">
        <TaskNavbarNode
          v-for="node in runningNodes"
          :key="node.id"
          :node="node"
          @locate-node="scrollToNode"
        />
      </div>
    </div>
  </div>
</template>


<script>
import TaskTreeNode from "./TaskTreeNode.vue";
import TaskSidebarNode from "./TaskSidebarNode.vue";
import TaskProgressBar from "./TaskProgressBar.vue";
import TaskNavbarNode from "./TaskNavbarNode.vue";
import { getFormattedDate, getFormattedTime } from "../utils/dateTimeUtils";

export default {
  name: "TaskTree",
  components: {
    TaskTreeNode,
    TaskSidebarNode,
    TaskProgressBar,
    TaskNavbarNode,
  },
  data() {
    const rootId = Date.now();
    const rootNode = this.createNode(true);

    return {
      nodes: [rootNode],
      nodeMap: { [rootId]: rootNode },
      userId: 1,
      loadingState: 0,
      loadError: null,
      saveTimer: null,
    };
  },
  computed: {
    pendingNodes() {
      return Object.values(this.nodeMap)
        .filter((node) => node.completed === 0)
        .sort((a, b) => a.estimatedTime - b.estimatedTime);
    },
    runningNodes() {
      return Object.values(this.nodeMap)
        .filter((node) => node.startTime > 0 && node.completed === 0)
        .sort((a, b) => a.remainingTime - b.remainingTime);
    },
  },
  async created() {
    await this.loadTaskTree();
    this.saveTimer = setInterval(() => {
      this.saveTaskTree();
    }, 5000);
  },
  beforeUnmount() {
    if (this.saveTimer) {
      clearInterval(this.saveTimer);
      this.saveTimer = null;
    }
    this.saveTaskTree();
  },
  methods: {
    async loadTaskTree() {
      try {
        const today = getFormattedDate();
        const response = await this.$axios.get(
          `/api/task-tree/${this.userId}/${today}`
        );
        this.nodes = response.data.nodes;
        this.buildNodeMap();
        this.loadingState = 1;
      } catch (error) {
        this.loadError = "加载任务树失败，将使用默认数据";
        this.createDefaultTree();
        this.loadingState = -1;
      }
    },
    async saveTaskTree() {
      if (this.loadingState != 1)return ;
      try {
        const today = getFormattedDate();
        await this.$axios.post(`/api/task-tree/${this.userId}/${today}`, {
          nodes: this.nodes,
        });
        this.loadError = null;
      } catch (error) {
        console.error("Failed to save task tree:", error);
        this.loadError = "保存任务树失败，请检查网络连接";
      }
    },
    createDefaultTree() {
      const rootId = Date.now();
      const rootNode = this.createNode(1);
      this.nodes = [rootNode];
      this.nodeMap = { [rootId]: rootNode };
    },
    buildNodeMap() {
      const map = {};
      const buildMap = (nodes) => {
        nodes.forEach((node) => {
          map[node.id] = node;
          if (node.children && node.children.length > 0) {
            buildMap(node.children);
          }
        });
      };
      buildMap(this.nodes);
      this.nodeMap = map;
    },

    createNode(isRoot, parentId = null) {
      const nodeId = Date.now();
      return {
        id: nodeId,
        parentId: parentId,
        text: "",
        comment: "",
        estimatedTime: isRoot ? 90 : 5,
        remainingTime: (isRoot ? 90 : 5) * 60,
        startTime: 0,
        elapsedTime: 0,
        completed: 0,
        timeStamp: isRoot ? getFormattedDate() : getFormattedTime(),
        children: [],
      };
    },
    addChild(parentId) {
      const newNode = this.createNode(false, parentId);
      const parentNode = this.nodeMap[parentId];
      if (parentNode) {
        parentNode.children.push(newNode);
        this.nodeMap[newNode.id] = newNode;
      }
    },
    addRootNode() {
      const newNode = this.createNode(true);
      this.nodes.push(newNode);
      this.nodeMap[newNode.id] = newNode;
    },
    handleContainerDoubleClick(event) {
      if (this.isClickOnEmptyArea(event)) {
        this.addRootNode();
      }
    },
    isClickOnEmptyArea(event) {
      let element = event.target;

      while (element && element !== event.currentTarget) {
        if (
          element.classList.contains("node-content") ||
          element.classList.contains("comment-container")
        ) {
          return false;
        }
        element = element.parentElement;
      }

      return true;
    },
    deleteNode(nodeId) {
      const nodeToDelete = this.nodeMap[nodeId];
      if (!nodeToDelete) return;

      if (nodeToDelete.parentId === null) {
        const rootNodes = this.nodes.filter((node) => node.parentId === null);

        if (rootNodes.length === 1) {
          nodeToDelete.children.forEach((child) => {
            this.deleteNode(child.id);
          });
          nodeToDelete.children = [];
          return;
        } else {
          const index = this.nodes.findIndex((node) => node.id === nodeId);
          if (index !== -1) {
            this.nodes.splice(index, 1);
          }
        }
      } else {
        const parentNode = this.nodeMap[nodeToDelete.parentId];
        if (parentNode) {
          const index = parentNode.children.findIndex(
            (child) => child.id === nodeId
          );
          if (index !== -1) {
            parentNode.children.splice(index, 1);
          }
        }
      }

      const removeFromMap = (node) => {
        node.children.forEach((child) => removeFromMap(child));
        delete this.nodeMap[node.id];
        this.$forceUpdate();
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
        }, 5000);
      }
    },
  },
};
</script>

<style scoped>
.task-container {
  display: flex;
  flex-direction: column;
  max-height: 100vh;
  overflow: hidden;
}

.content-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar-container {
  width: 250px;
  background-color: white;
  border-right: 2px solid #3481ce;
  overflow-y: auto;
}

.task-tree-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
  overflow-y: auto;
  padding: 5px;
}

.navbar-container {
  width: 250px;
  background-color: white;
  border-left: 2px solid #4db6ac; /* 青色边框 */
  overflow-y: auto;
}
</style>

