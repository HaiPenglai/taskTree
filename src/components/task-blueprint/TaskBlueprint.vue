<!-- src\components\task-blueprint\TaskBlueprint.vue -->
<template>
  <div class="task-container">
    <div class="loading-text" v-if="loadError != null">
      {{ loadError }}
    </div>

    <div class="content-wrapper">
      <div class="sidebar-container">
        <TaskBlueprintSidebarNode
          v-for="(node, index) in pendingRootNodes"
          :key="node.id"
          :node="node"
          :index="index + 1"
          @locate-node="scrollToNode"
        />
      </div>
      <div class="blueprint-container" @dblclick="handleContainerDoubleClick">
        <TaskBlueprintNode
          v-for="node in nodes"
          :key="node.id"
          :node="node"
          @add-child="addChild"
          @delete-node="deleteNode"
          @move-node="moveNode"
        />
      </div>
      <div class="navbar-container">
        <TaskBlueprintNavbarNode
          v-for="(node, index) in completedRootNodes"
          :key="node.id"
          :node="node"
          :index="completedRootNodes.length - index"
          @locate-node="scrollToNode"
        />
      </div>
    </div>
  </div>
</template>


<script>
import TaskBlueprintNode from "./TaskBlueprintNode.vue";
import { getFormattedDate } from "../../utils/dateTimeUtils";
import TaskBlueprintSidebarNode from "./TaskBlueprintSidebarNode.vue";
import TaskBlueprintNavbarNode from "./TaskBlueprintNavbarNode.vue";

export default {
  name: "TaskBlueprint",
  components: {
    TaskBlueprintNode,
    TaskBlueprintSidebarNode,
    TaskBlueprintNavbarNode,
  },
  data() {
    const rootId = Date.now();
    const rootNode = this.createNode(true);

    return {
      nodes: [rootNode],
      nodeMap: { [rootId]: rootNode },
      userId: this.getCurrentUserId(),
      loadError: null,
    };
  },
  computed: {
    pendingRootNodes() {
      return this.nodes.filter((node) => node.completed === 0);
    },
    completedRootNodes() {
      return this.nodes
        .filter((node) => node.completed === 1)
        .sort((a, b) => b.id - a.id);
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
  emits: ['add-child', 'delete-node', 'move-node'],
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
    async loadTaskTree() {
      this.loadError = "Loading";
      try {
        const response = await this.$axios.get(
          `/api/task-blueprint/${this.userId}`
        );
        this.nodes = response.data.nodes;
        this.buildNodeMap();
        this.loadError = null;
      } catch (error) {
        this.createDefaultTree();
        this.loadError = "加载任务蓝图失败，将使用默认数据";
      }
    },
    async saveTaskTree() {
      if (this.loadError != null) return;
      try {
        await this.$axios.post(`/api/task-blueprint/${this.userId}`, {
          nodes: this.nodes,
        });
        this.loadError = null;
      } catch (error) {
        this.loadError = "保存任务蓝图失败，请检查网络连接";
      }
    },
    createDefaultTree() {
      const rootId = Date.now();
      const rootNode = this.createNode();
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

    createNode(parentId = null) {
      const nodeId = Date.now();
      return {
        id: nodeId,
        parentId: parentId,
        text: "",
        completed: 0,
        timeStamp: getFormattedDate(),
        hidden: 0,
        children: [],
      };
    },
    addChild(parentId) {
      const newNode = this.createNode(parentId);
      const parentNode = this.nodeMap[parentId];
      if (parentNode) {
        parentNode.children.push(newNode);
        this.nodeMap[newNode.id] = newNode;
      }
    },
    addRootNode() {
      const newNode = this.createNode();
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
        if (element.classList.contains("node-content")) {
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
  gap: 0px;
}

.sidebar-container {
  width: 250px;
  background-color: white;
  border-right: 2px solid #9c64ff;
  overflow-y: auto;
  padding: 2px 0;
}

.blueprint-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  padding: 15px;
}

.navbar-container {
  width: 250px;
  background-color: white;
  border-left: 2px solid #f46f99;
  overflow-y: auto;
  padding: 2px 0;
}

.task-tree-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
  overflow-y: auto;
  padding: 5px;
}

.loading-text {
  color: grey;
}
</style>

