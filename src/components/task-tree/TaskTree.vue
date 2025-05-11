<!-- src\components\task-tree\TaskTree.vue -->
<template>
  <div class="task-container">
    <div class="loading-text" v-if="loadError != null">
      {{ loadError }}
    </div>

    <TaskTreeProgressBar :node-map="nodeMap" @locate-node="scrollToNode" />
    <div class="content-wrapper">
      <div class="sidebar-container">
        <TaskTreeSidebarNode
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
        <TaskTreeNavbarNode
          v-for="node in runningNodes"
          :key="node.id"
          :node="node"
          @locate-node="scrollToNode"
        />

        <TaskTreeOKNode
          v-for="node in completedNodes"
          :key="node.id"
          :node="node"
          @locate-node="scrollToNode"
        />
      </div>
    </div>
  </div>

  <input type="date" v-model="selectedDate" class="date-input" />
</template>


<script>
import TaskTreeNode from "./TaskTreeNode.vue";
import TaskTreeSidebarNode from "./TaskTreeSidebarNode.vue";
import TaskTreeProgressBar from "./TaskTreeProgressBar.vue";
import TaskTreeNavbarNode from "./TaskTreeNavbarNode.vue";
import { getFormattedDate, getFormattedTime } from "../../utils/dateTimeUtils";
import TaskTreeOKNode from "./TaskTreeOKNode.vue";

export default {
  name: "TaskTree",
  components: {
    TaskTreeNode,
    TaskTreeSidebarNode,
    TaskTreeProgressBar,
    TaskTreeNavbarNode,
    TaskTreeOKNode,
  },
  data() {
    const today = getFormattedDate();
    const rootId = Date.now();
    const rootNode = this.createNode(true);

    return {
      nodes: [rootNode],
      nodeMap: { [rootId]: rootNode },
      userId: this.getCurrentUserId(),
      loadError: null,
      saveTimer: null,
      selectedDate: today,
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
    completedNodes() {
      return Object.values(this.nodeMap)
        .filter((node) => node.completed != 0)
        .sort(
          (a, b) =>
            new Date(b.startTime + b.elapsedTime) -
            new Date(a.startTime + a.elapsedTime)
        );
    },
  },
  watch: {
    selectedDate(newDate, oldDate) {
      if (newDate !== oldDate) {
        this.loadTaskTree();
      }
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
    getCurrentUserId() {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          return user.id;
        } catch (e) {
          return 1;
        }
      }
      return 1;
    },
    createNode(isRoot, parentId = null) {
      const nodeId = Date.now();
      return {
        id: nodeId,
        parentId: parentId,
        text: "",
        comment: "",
        estimatedTime: isRoot ? 10 : 5,
        remainingTime: (isRoot ? 10 : 5) * 60,
        startTime: 0,
        elapsedTime: 0,
        completed: 0,
        timeStamp: isRoot ? getFormattedDate() : getFormattedTime(),
        hidden: 0,
        children: [],
      };
    },
    async loadTaskTree() {
      this.loadError = "Loading";
      try {
        const response = await this.$axios.get(
          `/api/task-tree/${this.userId}/${this.selectedDate}`
        );
        this.nodes = response.data.nodes;
        this.buildNodeMap();
        this.loadError = null;
      } catch (error) {
        this.createDefaultTree();
        this.loadError = "加载任务树失败，将使用默认数据";
      }
    },
    async saveTaskTree() {
      if (this.loadError != null) return;
      try {
        await this.$axios.post(
          `/api/task-tree/${this.userId}/${this.selectedDate}`,
          {
            nodes: this.nodes,
          }
        );
        this.loadError = null;
      } catch (error) {
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

      const deleteChildren = (node) => {
        if (node.children && node.children.length > 0) {
          node.children.forEach((child) => {
            deleteChildren(child);
            delete this.nodeMap[child.id];
          });
        }
      };
      deleteChildren(nodeToDelete);
      if (nodeToDelete.parentId) {
        const parent = this.nodeMap[nodeToDelete.parentId];
        if (parent && parent.children) {
          parent.children = parent.children.filter(
            (child) => child.id !== nodeId
          );
        }
      } else {
        this.nodes = this.nodes.filter((node) => node.id !== nodeId);
      }
      delete this.nodeMap[nodeId];
      if (this.nodes.length === 0) this.createDefaultTree();
    },
    moveNode({ nodeId, direction }) {
      const node = this.nodeMap[nodeId];
      const parent = this.nodeMap[node.parentId];
      let siblings = this.nodes;
      if (parent) siblings = parent.children;

      const currentIndex = siblings.findIndex((n) => n.id === nodeId);
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

.loading-text {
  color: grey;
}

.date-input {
  position: absolute;
  bottom: 0px;
  left: 0px;
  width: 120px;
  padding: 4px;
  border: none;
  outline: none;
  border-radius: 4px;
  font-size: 16px;
  background-color: #b4d9fe;
  color: white;
  font-weight: bold;
}
</style>

