<!-- src\components\task-blueprint\TaskBlueprint.vue -->
<template>
  <div class="task-container">
    <div class="loading-text" v-if="loadError != null">
      {{ loadError }}
    </div>

    <div class="content-wrapper">
      <div class="sidebar-container">
        <TaskBlueprintSidebarNode
          v-for="(node, index) in pendingNodes"
          :key="node.id"
          :node="node"
          :index="index + 1"
          :is-active="node.id === currentRootId"
          @locate-node="scrollToNode"
          @click-node="handleNodeClick"
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
          @update-root="handleRootUpdate"
        />
        <button class="add-root-button" @click="addRootNode">+</button>
      </div>
      <div class="navbar-container">
        <TaskBlueprintNavbarNode
          v-for="(node, index) in completedNodes"
          :key="node.id"
          :node="node"
          :index="completedNodes.length - index"
          :is-active="node.id === currentRootId"
          @locate-node="scrollToNode"
          @click-node="handleNodeClick"
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
      roots: [],
      currentRootId: null,
    };
  },
  computed: {
    pendingNodes() {
      return this.roots.filter(node => node.completed === 0)
        .sort((a, b) => b.id - a.id);
    },
    completedNodes() {
      return this.roots.filter(node => node.completed === 1)
        .sort((a, b) => b.id - a.id);
    },
  },
  async created() {
    await this.loadBlueprintRoots();
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
    async loadBlueprintRoots() {
      this.loadError = "Loading roots...";
      try {
        const response = await this.$axios.get(
          `/api/task-blueprint-roots/${this.userId}`
        );
        
        if (response.data.success) {
          this.roots = response.data.roots;
          if (this.pendingNodes.length > 0) {
            await this.loadBlueprintTree(this.pendingNodes[0].id);
          } else if (this.roots.length > 0) {
            await this.loadBlueprintTree(this.roots[0].id);
          } else {
            await this.createDefaultTree();
          }
        }
        this.loadError = null;
      } catch (error) {
        await this.createDefaultTree();
        this.loadError = "加载任务蓝图根节点失败，将使用默认数据";
      }
    },
    
    async loadBlueprintTree(rootId) {
      this.loadError = "Loading tree...";
      try {
        const response = await this.$axios.get(
          `/api/task-blueprint-tree/${this.userId}/${rootId}`
        );
        
        if (response.data.success) {
          this.nodes = response.data.nodes;
          this.currentRootId = rootId;
          this.buildNodeMap();
        }
        this.loadError = null;
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // 如果找不到树，创建新的树并保存
          const rootNode = {
            id: rootId,
            parentId: null,
            text: "新蓝图树",
            comment: "",
            completed: 0,
            timeStamp: getFormattedDate(),
            hidden: 0,
            children: []
          };
          
          this.nodes = [rootNode];
          this.currentRootId = rootId;
          this.nodeMap = { [rootId]: rootNode };
          
          // 保存到后端
          try {
            await this.$axios.post(`/api/task-blueprint/${this.userId}`, {
              nodes: this.nodes,
              root_id: this.currentRootId
            });
          } catch (saveError) {
            console.error("保存新蓝图树失败:", saveError);
            this.loadError = "创建新蓝图树失败";
          }
        } else {
          this.loadError = "加载任务蓝图树失败";
        }
      }
    },
    
    async saveTaskTree() {
      if (this.loadError != null || !this.currentRootId) return;
      
      try {
        await this.$axios.post(`/api/task-blueprint/${this.userId}`, {
          nodes: this.nodes,
          root_id: this.currentRootId
        });
        
        // 更新roots中对应的根节点信息
        const rootNode = { ...this.nodes[0] };
        delete rootNode.children;
        const rootIndex = this.roots.findIndex(r => r.id === this.currentRootId);
        if (rootIndex >= 0) {
          this.roots[rootIndex] = rootNode;
        } else {
          this.roots.push(rootNode);
        }
        
        this.loadError = null;
      } catch (error) {
        this.loadError = "保存任务蓝图失败，请检查网络连接";
      }
    },
    
    async deleteTree(rootId) {
      try {
        await this.$axios.delete(`/api/task-blueprint/${this.userId}/${rootId}`);
        this.roots = this.roots.filter(r => r.id !== rootId);
        
        if (this.currentRootId === rootId) {
          // 如果删除的是当前树，切换到其他树
          if (this.pendingNodes.length > 0) {
            await this.loadBlueprintTree(this.pendingNodes[0].id);
          } else if (this.roots.length > 0) {
            await this.loadBlueprintTree(this.roots[0].id);
          } else {
            this.createDefaultTree();
          }
        }
      } catch (error) {
        this.loadError = "删除任务蓝图失败";
      }
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
    
    async f() {
      const rootId = Date.now();
      const rootNode = {
        id: rootId,
        parentId: null,
        text: "蓝图根节点",
        comment: "",
        completed: 0,
        timeStamp: getFormattedDate(),
        hidden: 0,
        children: []
      };
      
      this.nodes = [rootNode];
      this.nodeMap = { [rootId]: rootNode };
      this.currentRootId = rootId;
      
      // 添加到roots
      const rootNodeWithoutChildren = { ...rootNode };
      delete rootNodeWithoutChildren.children;
      this.roots = [rootNodeWithoutChildren];

      // 立即保存到后端
      try {
        await this.$axios.post(`/api/task-blueprint/${this.userId}`, {
          nodes: this.nodes,
          root_id: this.currentRootId
        });
      } catch (error) {
        console.error("保存默认蓝图树失败:", error);
        this.loadError = "创建默认蓝图树失败";
      }
    },

    async addRootNode() {
      const newNode = {
        id: Date.now(),
        parentId: null,
        text: "新蓝图树",
        comment: "",
        completed: 0,
        timeStamp: getFormattedDate(),
        hidden: 0,
        children: []
      };
      
      this.nodes = [newNode];
      this.currentRootId = newNode.id;
      this.nodeMap = { [newNode.id]: newNode };
      
      // 添加到roots
      const rootNodeWithoutChildren = { ...newNode };
      delete rootNodeWithoutChildren.children;
      this.roots.push(rootNodeWithoutChildren);

      // 立即保存到后端
      try {
        await this.$axios.post(`/api/task-blueprint/${this.userId}`, {
          nodes: this.nodes,
          root_id: this.currentRootId
        });
      } catch (error) {
        console.error("保存新蓝图树失败:", error);
        this.loadError = "创建新蓝图树失败";
        // 创建失败时回滚
        this.roots.pop();
      }
    },

    createNode(parentId = null) {
      const nodeId = Date.now();
      return {
        id: nodeId,
        parentId: parentId,
        text: "",
        comment: "",
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
    async handleContainerDoubleClick(event) {
      if (this.isClickOnEmptyArea(event)) {
        await this.addRootNode();
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
    async deleteNode(nodeId) {
      const nodeToDelete = this.nodeMap[nodeId];
      if (!nodeToDelete) return;

      // 如果是根节点，需要从数据库中删除整个树
      if (!nodeToDelete.parentId) {
        try {
          await this.$axios.delete(`/api/task-blueprint/${this.userId}/${nodeId}`);
          // 从roots中移除
          this.roots = this.roots.filter(r => r.id !== nodeId);
          
          // 如果还有其他节点，切换到其他节点
          if (this.completedNodes.length > 0) {
            // 优先切换到已完成节点
            await this.loadBlueprintTree(this.completedNodes[0].id);
          } else if (this.pendingNodes.length > 0) {
            // 其次切换到未完成节点
            await this.loadBlueprintTree(this.pendingNodes[0].id);
          } else {
            // 如果没有其他节点，创建新的默认树
            await this.createDefaultTree();
          }
          return;
        } catch (error) {
          console.error("删除蓝图树失败:", error);
          this.loadError = "删除蓝图树失败";
          return;
        }
      }

      // 删除普通节点的逻辑
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
      
      // 如果删除后没有节点了，创建默认树
      if (this.nodes.length === 0) {
        await this.createDefaultTree();
      }
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
    async handleNodeClick(rootId) {
      if (rootId !== this.currentRootId) {
        await this.saveTaskTree();
        await this.loadBlueprintTree(rootId);
      } else {
        this.scrollToNode(rootId);
      }
    },
    handleRootUpdate({ id, completed, text }) {
      const rootIndex = this.roots.findIndex(r => r.id === id);
      if (rootIndex === -1) return;
      
      const updatedRoot = {
        ...this.roots[rootIndex],
        completed,
        text
      };
      
      this.roots = this.roots.filter(r => r.id !== id);
      
      this.roots.push(updatedRoot);
    }
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

.add-root-button {
  position: fixed;
  left: 0px;
  bottom: 0px;
  width: 29px;
  height: 29px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-root-button:hover {
  background-color: #3e8e41;
}
</style>

