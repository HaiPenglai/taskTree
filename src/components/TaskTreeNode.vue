<!-- src\components\TaskTreeNode.vue -->
<template>
  <div class="task-tree-node">
    <div
      class="node-content"
      :class="{
        'completed-success': node.completed === 1,
        'completed-failure': node.completed === -1,
      }"
    >
      <button class="delete-button" @click.stop="$emit('delete-node', node.id)">
        <span class="delete-icon">×</span>
      </button>
      <div class="node-main">
        <div class="toolbar">
          <div class="time-stamp">
            {{ node.timeStamp }}
          </div>
          <input
            v-model.number="node.estimatedTime"
            type="number"
            min="1"
            class="time-input"
            placeholder="5"
            @change="updateRemainingTime"
            :disabled="node.completed != 0"
          />
          <div class="time-display">
            {{ formatTime(node.remainingTime) }}
          </div>
          <button
            class="action-button start-button"
            @click.stop="toggleTimer"
            :disabled="node.completed != 0"
          >
            {{ node.completed == 1 ? "完成" : node.completed == 0 ? "开始" : "失败" }}
          </button>
          <div class="move-buttons">
            <button class="triangle-up" @click="moveUp"></button>
            <button class="triangle-down" @click="moveDown"></button>
          </div>
        </div>
        <textarea
          v-model="node.text"
          ref="textarea"
          class="node-text"
          :placeholder="'输入任务内容'"
          @focus="editing = true"
          @blur="editing = false"
          @input="autoResize"
          rows="1"
          style="resize: none; overflow: hidden"
          :disabled="node.completed != 0"
        ></textarea>
      </div>
      <button
        class="action-button add-button"
        @click.stop="addChild"
        :disabled="node.completed != 0"
      >
        +
      </button>
    </div>

    <div class="children" v-if="node.children && node.children.length > 0">
      <div class="connector"></div>
      <div class="children-nodes">
        <TaskTreeNode
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          @add-child="$emit('add-child', $event)"
          @delete-node="$emit('delete-node', $event)"
          @move-node="$emit('move-node', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TaskTreeNode",
  props: {
    node: {
      type: Object,
      required: true,
      default: () => ({
        id: null,
        text: "",
        estimatedTime: 5,
        remainingTime: 5 * 60,
        completed: 0,
        actualTime: 0,
      }),
    },
  },
  data() {
    return {
      editing: false,
      timerRunning: false,
      timerInterval: null,
      startTime: null,
    };
  },
  methods: {
    autoResize() {
      const textarea = this.$refs.textarea;
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    },
    addChild() {
      this.$emit("add-child", this.node.id);
    },
    toggleTimer() {
      if (this.timerRunning) {
        clearInterval(this.timerInterval);
        this.timerRunning = false;
        this.node.completed = 1;
        this.node.actualTime = Math.floor((Date.now() - this.startTime) / 1000);
      } else {
        this.timerRunning = true;
        this.startTime = Date.now();

        this.timerInterval = setInterval(() => {
          const elapsedSeconds = Math.floor(
            (Date.now() - this.startTime) / 1000
          );
          this.node.remainingTime = Math.max(
            0,
            this.node.estimatedTime * 60 - elapsedSeconds
          );

          if (this.node.remainingTime <= 0) {
            clearInterval(this.timerInterval);
            this.timerRunning = false;
            this.node.completed = -1;
            this.node.actualTime = elapsedSeconds;
            this.node.remainingTime = 0;
          }
        }, 1000);
      }
    },
    updateRemainingTime() {
      this.node.remainingTime = this.node.estimatedTime * 60;
    },
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    },
    moveUp() {
      this.$emit("move-node", { nodeId: this.node.id, direction: -1 });
    },
    moveDown() {
      this.$emit("move-node", { nodeId: this.node.id, direction: 1 });
    },
  },
  beforeUnmount() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  },
};
</script>

<style scoped>
.task-tree-node {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.node-content {
  display: flex;
  align-items: stretch;
  gap: 0;
  background-color: #a8e6a8;
  border-radius: 4px;
  width: fit-content;
  position: relative;
  overflow: hidden;
}

.node-content.completed-success {
  background-color: #97e9bd;
}

.node-content.completed-failure {
  background-color: #a0e858;
  opacity: 0.8;
}

.node-content {
  background-color: #a8e6a8;
  transition: background-color 0.3s ease;
}

.node-main {
  flex-grow: 1;
  padding: 5px 8px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 300px;
}

.node-text {
  border: none;
  padding: 4px;
  background-color: #e9fad3;
  font-size: 15px;
  font-weight: 200;
  outline: none;
  width: 100%;
  color: #444;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

.node-text:placeholder {
  color: #888;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.time-input {
  width: 40px;
  padding: 4px;
  border: 0px solid #ddd;
  border-radius: 3px;
  text-align: center;
  background-color: #d9f9e3;
  color: #555;
  font-weight: 400;
}

.time-stamp {
  text-align: left;
  border: 0px solid #ddd;
  background: transparent;
  color: white;
}

.time-display {
  min-width: 50px;
  text-align: center;
  border: 0px solid #ddd;
  background-color: #d2f7cc;
  padding: 4px;
  border-radius: 3px;
  color: #555;
}

.action-button {
  padding: 4px 8px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.start-button {
  background: #4caf50;
  color: white;
}

.start-button:hover:not(:disabled) {
  background: #3e8e41;
}

.move-buttons {
  display: flex;
  flex-direction: column;
  background: transparent;
  gap: 1px;
}

.triangle-up,
.triangle-down {
  width: 11px;
  height: 11px;
  background: #3e8e41;
  padding: 0;
  margin: 0;
  border: none;
  cursor: pointer;
  outline: none;
}

.triangle-up {
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

.triangle-down {
  clip-path: polygon(0% 0%, 100% 0%, 50% 100%);
}

.add-button {
  background: #4caf50;
  color: white;
  border: none;
  width: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: background 0.2s;
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

.delete-button {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 22px;
  height: 22px;
  border-bottom-left-radius: 100%;
  background-color: #9e9e9e;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  z-index: 1;
  transition: all 0.2s ease;
}

.delete-button:hover {
  background-color: #f44336;
  transform: scale(1.1);
}

.delete-icon {
  line-height: 1;
  margin-top: -2px;
}
</style>