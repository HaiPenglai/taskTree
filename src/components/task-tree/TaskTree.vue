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
      <div class="task-tree-container" @dblclick="handleContainerDoubleClick" @contextmenu.prevent="toggleRestList" @mousedown="handleContainerClick">
        <TaskTreeNode
          v-for="node in nodes"
          :key="node.id"
          :node="node"
          @add-child="addChild"
          @delete-node="deleteNode"
          @move-node="moveNode"
        />
        <RestList :user-id="userId" :date="selectedDate" v-model:visible="restListVisible" :position="restListPosition" />
      </div>

      <div class="navbar-container">
        <TaskTreeNavbarNode
          v-for="node in runningNodes"
          :key="node.id"
          :node="node"
          @locate-node="scrollToNode"
        />

        <TaskTreeOKNode
          v-for="(node, index) in completedNodes"
          :key="node.id"
          :node="node"
          :index="completedNodes.length - index"
          @locate-node="scrollToNode"
        />
      </div>
    </div>
  </div>

  <div class="date-stats-container">
    <input type="date" v-model="selectedDate" class="date-input" />
    <div class="total-time">{{ formattedTotalTime }}</div>
    <div class="total-chars">{{ formattedCharsWithCPM }}</div>
    <button class="add-root-button" @click="addRootNode">+</button>
    <button class="add-rest-button" @click="showRestList">休</button>
    <button class="add-calendar-button" @click="showCalendar">日</button>
    <button class="add-note-button" @click="toggleNoteCenter">记</button>
  </div>

  <Calendar
    ref="calendar"
    :user-id="userId"
    :selected-date="selectedDate"
    v-model:visible="calendarVisible"
    @trigger-calendar="handleCalendarTrigger"
  />

  <Note :user-id="userId" :date="selectedDate" v-model:visible="noteVisible" :position="notePosition" />
</template>


<script>
import TaskTreeNode from "./TaskTreeNode.vue";
import TaskTreeSidebarNode from "./TaskTreeSidebarNode.vue";
import TaskTreeProgressBar from "./TaskTreeProgressBar.vue";
import TaskTreeNavbarNode from "./TaskTreeNavbarNode.vue";
import { getFormattedDate, getFormattedTime } from "../../utils/dateTimeUtils";
import TaskTreeOKNode from "./TaskTreeOKNode.vue";
import RestList from "../rest-list/RestList.vue";
import Calendar from "../calendar/Calendar.vue";
import Note from "../note/Note.vue";

export default {
  name: "TaskTree",
  components: {
    TaskTreeNode,
    TaskTreeSidebarNode,
    TaskTreeProgressBar,
    TaskTreeNavbarNode,
    TaskTreeOKNode,
    RestList,
    Calendar,
    Note,
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
      totalWorkTime: 0,
      totalChars: 0,
      previousChars: 0,
      charChangeQueue: [],
      isInitialLoad: true,  // Add flag for initial load
      restListVisible: false,
      restListPosition: { x: 0, y: 0 },
      calendarVisible: false,
      noteVisible: false,
      notePosition: { x: 0, y: 0 },
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
    formattedTotalTime() {
      const hours = Math.floor(this.totalWorkTime / 3600);
      const minutes = Math.floor((this.totalWorkTime % 3600) / 60);
      const seconds = Math.floor(this.totalWorkTime % 60);
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
    formattedCharsWithCPM() {
      if (this.charChangeQueue.length === 0) {
        return `${this.totalChars}`;
      }
      
      const totalIncrease = this.charChangeQueue.reduce((sum, val) => sum + val, 0);
      const minutes = this.charChangeQueue.length * (5 / 60); // Convert seconds to minutes
      const cpm = Math.round(totalIncrease / minutes);
      
      return `${this.totalChars}${cpm > 0 ? ` (cpm:${cpm})` : ''}`;
    }
  },
  watch: {
    selectedDate(newDate, oldDate) {
      if (newDate !== oldDate) {
        this.isInitialLoad = true; // Reset initial load flag when changing dates
        this.loadTaskTree();
        this.calendarVisible = false;  // 切换日期时关闭日历
        this.charChangeQueue = []; // Reset typing speed tracking
      }
    },
  },
  async created() {
    await this.loadTaskTree();
    this.previousChars = this.totalChars;
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
        estimatedTime: isRoot ? 99 : 99,
        remainingTime: (isRoot ? 99 : 99) * 60,
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
        this.calculateTotalWorkTime();
        await this.calculateTotalChars();
        
        // Load total time and chars
        const timeResponse = await this.$axios.get(
          `/api/task-time/${this.userId}/${this.selectedDate}`
        );
        if (timeResponse.data.success) {
          this.totalWorkTime = timeResponse.data.totalTime;
          this.totalChars = timeResponse.data.totalChars;
        }
        
        this.loadError = null;
      } catch (error) {
        this.createDefaultTree();
        this.loadError = "加载任务树失败，将使用默认数据";
      }
    },
    async saveTaskTree() {
      if (this.loadError != null) return;
      
      this.calculateTotalWorkTime();
      await this.calculateTotalChars();
      
      try {
        await this.$axios.post(
          `/api/task-tree/${this.userId}/${this.selectedDate}`,
          {
            nodes: this.nodes,
          }
        );
        
        await this.$axios.post(
          `/api/task-time/${this.userId}/${this.selectedDate}`,
          {
            totalTime: this.totalWorkTime,
            totalChars: this.totalChars
          }
        );
        
        // 检查日历触发
        if (this.$refs.calendar) {
          this.$refs.calendar.checkTriggers();
        }
        
        this.loadError = null;
      } catch (error) {
        this.loadError = "保存任务树失败，请检查网络连接";
      }
    },
    calculateTotalWorkTime() {
      const timeNodes = Object.values(this.nodeMap).filter(
        node => node.startTime > 0 && node.elapsedTime > 0
      );
      
      if (timeNodes.length === 0) {
        this.totalWorkTime = 0;
        return;
      }
      
      let intervals = timeNodes.map(node => ({
        start: node.startTime,
        end: node.startTime + (node.elapsedTime * 1000)
      }));
      
      intervals.sort((a, b) => a.start - b.start);
      
      const mergedIntervals = [intervals[0]];
      
      for (let i = 1; i < intervals.length; i++) {
        const currentInterval = intervals[i];
        const lastMergedInterval = mergedIntervals[mergedIntervals.length - 1];
        
        if (currentInterval.start <= lastMergedInterval.end) {
          lastMergedInterval.end = Math.max(lastMergedInterval.end, currentInterval.end);
        } else {
          mergedIntervals.push(currentInterval);
        }
      }
      
      const totalTimeMs = mergedIntervals.reduce(
        (sum, interval) => sum + (interval.end - interval.start),
        0
      );
      
      // 将毫秒转换为秒
      this.totalWorkTime = Math.floor(totalTimeMs / 1000);
    },
    async calculateTotalChars() {
      const calculateNodeChars = (node) => {
        let chars = (node.text || '').length + (node.comment || '').length;
        if (node.children && node.children.length > 0) {
          chars += node.children.reduce((sum, child) => sum + calculateNodeChars(child), 0);
        }
        return chars;
      };
      
      // Calculate chars from task tree
      const taskChars = this.nodes.reduce((sum, node) => sum + calculateNodeChars(node), 0);
      
      // Get notebook chars
      try {
        const noteResponse = await this.$axios.get(`/api/note/${this.userId}/${this.selectedDate}`);
        if (noteResponse.data.success) {
          const noteChars = (noteResponse.data.note || '').length;
          const newTotalChars = taskChars + noteChars;
          
          // Calculate character increase only if not initial load
          if (!this.isInitialLoad) {
            const charIncrease = newTotalChars - this.previousChars;
            if (charIncrease > 0) {
              this.charChangeQueue.push(charIncrease);
              if (this.charChangeQueue.length > 12) {
                this.charChangeQueue.shift(); // Remove oldest entry if queue is too long
              }
            }
          } else {
            this.isInitialLoad = false; // Reset initial load flag after first calculation
          }
          
          this.previousChars = newTotalChars;
          this.totalChars = newTotalChars;
        } else {
          this.totalChars = taskChars;
          this.previousChars = taskChars;
          if (this.isInitialLoad) {
            this.isInitialLoad = false;
          }
        }
      } catch (error) {
        console.error('Error loading note chars:', error);
        this.totalChars = taskChars;
        this.previousChars = taskChars;
        if (this.isInitialLoad) {
          this.isInitialLoad = false;
        }
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
    toggleRestList(event) {
      this.restListPosition = {
        x: event.clientX,
        y: event.clientY
      };
      this.restListVisible = !this.restListVisible;
    },
    showRestList() {
      if (this.restListVisible) {
        this.restListVisible = false;
      } else {
        // 在屏幕中央显示
        this.restListPosition = {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2
        };
        this.restListVisible = true;
      }
    },
    showCalendar() {
      this.calendarVisible = !this.calendarVisible;
    },
    handleCalendarTrigger(node) {
      // 当日历被触发时，显示通知
      alert(`日历提醒：${node.text}`);
      node.isCompleted = true;
    },
    toggleNoteCenter() {
      if (this.noteVisible) {
        this.noteVisible = false;
      } else {
        this.notePosition = {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2
        };
        this.noteVisible = true;
        this.restListVisible = false;
        this.calendarVisible = false;
      }
    },
    handleContainerClick(event) {
      // 只处理中键
      if (event.button !== 1) return;
      this.notePosition = {
        x: event.clientX,
        y: event.clientY
      };
      this.noteVisible = !this.noteVisible;
      this.restListVisible = false;
      this.calendarVisible = false;
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
  width: 200px;
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
  width: 200px;
  background-color: white;
  border-left: 2px solid #4db6ac; /* 青色边框 */
  overflow-y: auto;
}

.loading-text {
  color: grey;
}

.date-stats-container {
  position: absolute;
  bottom: 0px;
  left: 0px;
  display: flex;
  align-items: center;
}

.date-input {
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

.total-time {
  margin-left: 10px;
  padding: 5px 8px;
  background-color: #4db6ac;
  color: white;
  border-radius: 4px;
  font-weight: bold;
  font-size: 16px;
}

.total-chars {
  margin-left: 10px;
  padding: 0px 5px;
  background-color: #76b2f6;
  color: white;
  border-radius: 4px;
  font-weight: bold;
  font-size: 16px;
  height: 29px;
  display: flex;
  align-items: center;
}

.add-root-button {
  margin-left: 10px;
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

.add-rest-button {
  margin-left: 10px;
  width: 29px;
  height: 29px;
  background-color: #ff69b4;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-rest-button:hover {
  background-color: #ff1493;
}

.add-calendar-button {
  margin-left: 10px;
  width: 29px;
  height: 29px;
  background-color: #ffa12e;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-calendar-button:hover {
  background-color: #ff6b00;
}

.add-note-button {
  margin-left: 10px;
  width: 29px;
  height: 29px;
  background-color: #f92a76;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-note-button:hover {
  background-color: #eb0066;
}
</style>

