<!-- src\components\task-tree\TaskTreeNode.vue -->
<template>
  <button class="hide-button" @click="hideNode" v-if="node.hidden == 1">
    -
  </button>
  <div class="task-tree-node" v-else>
    <div class="node-self">
      <div
        class="node-content"
        :class="{
          'completed-success': node.completed === 1,
          'completed-failure': node.completed === -1,
        }"
        :data-node-id="node.id"
      >
        <button
          class="delete-button"
          @click.stop="$emit('delete-node', node.id)"
        >
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
              {{
                this.node.completed == 1
                  ? "成功"
                  : node.completed == -1
                  ? "失败"
                  : this.node.startTime == 0
                  ? "开始"
                  : "完成"
              }}
            </button>
            <button
              class="action-button comment-button"
              @click.stop="toggleComment"
            >
              批注
            </button>
            <div class="move-buttons">
              <button class="triangle-up" @click="moveUp"></button>
              <button class="triangle-down" @click="moveDown"></button>
            </div>
            <button class="hide-button" @click="hideNode">-</button>
          </div>
          <textarea
            v-model="node.text"
            ref="textarea"
            class="node-text"
            :placeholder="'开始构思任务'"
            @focus="editing = true"
            @blur="editing = false"
            @input="autoResize"
            rows="1"
            style="resize: none; overflow: hidden"
            :disabled="node.completed != 0"
          ></textarea>
        </div>
        <button class="add-button" @click.stop="addChild">+</button>
      </div>
      <div class="comment-container">
        <TaskTreeCommentNode
          v-model:comment="node.comment"
          :show-comment="showComment"
        />
      </div>
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
import TaskTreeCommentNode from "./TaskTreeCommentNode.vue";

export default {
  name: "TaskTreeNode",
  components: {
    TaskTreeCommentNode,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      editing: false,
      timerInterval: null,
      showComment: this.node.comment != "",
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.autoResize();
      if (this.node.completed == 0 && this.node.startTime != 0) this.runTimer();
    });
  },
  emits: ['add-child', 'delete-node', 'move-node'],
  methods: {
    autoResize() {
      const textarea = this.$refs.textarea;
      if(textarea == null)return;
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    },
    addChild() {
      this.$emit("add-child", this.node.id);
    },
    runTimer() {
      this.timerInterval = setInterval(() => {
        this.node.elapsedTime += 1;
        this.node.remainingTime =
          this.node.estimatedTime * 60 - this.node.elapsedTime;
        if (this.node.remainingTime <= 0) {
          clearInterval(this.timerInterval);
          this.node.completed = -1;
          this.node.remainingTime = 0;
        }
      }, 1000);
    },
    toggleTimer() {
      if (this.node.completed == 0 && this.node.startTime != 0) {
        clearInterval(this.timerInterval);
        this.node.completed = 1;
      } else {
        this.node.startTime = Date.now();
        this.runTimer();
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
    toggleComment() {
      this.showComment = !this.showComment;
    },
    moveUp() {
      this.$emit("move-node", { nodeId: this.node.id, direction: -1 });
    },
    moveDown() {
      this.$emit("move-node", { nodeId: this.node.id, direction: 1 });
    },
    hideNode() {
      this.node.hidden = 1 - this.node.hidden;
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

.highlight {
  animation: pulse 5s ease infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(126, 241, 124, 0.7);
  }
  70% {
    box-shadow: 0 0 0 100px rgba(255, 215, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 215, 0, 0);
  }
}

.node-self {
  display: flex;
}

.node-content {
  min-width: 390px;
  display: flex;
  align-items: stretch;
  gap: 0;
  background-color: #a8e6a8;
  border-radius: 4px;
  width: fit-content;
  position: relative;
  overflow: hidden;
  transition: background-color 0.3s ease;
}

.node-content.completed-success {
  background-color: #97e9bd;
}

.node-content.completed-failure {
  background-color: #a0e858;
  opacity: 0.8;
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
  cursor: pointer;
  background: #4caf50;
  color: white;
}

.start-button:hover:not(:disabled) {
  background: #3e8e41;
}

.comment-container {
  max-width: 300px;
  margin-top: 5px;
  margin-left: 0;
}

.comment-button {
  background: #4db6ac;
  color: white;
}

.comment-button:hover:not(:disabled) {
  background: #26a69a;
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

.hide-button {
  width: 18px;
  height: 17px;
  background: #4caf50;
  color: white;
  border: 0;
  cursor: pointer;
}

.hide-button:hover {
  background: #3e8e41;
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
  border-left: 2px solid #59b96e;
  border-bottom: 1px solid #59b96e;
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