<!-- src\components\task-blueprint\TaskBlueprintNode.vue -->
<template>
  <button class="hide-button" @click="hideNode" v-if="node.hidden">-</button>
  <div class="task-tree-node" v-else>
    <div class="node-self">
      <div
        class="node-content"
        :class="{
          'completed-success': node.completed === 1,
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
            <div
              class="time-stamp"
              :class="{ completed: node.completed === 1 }"
            >
              {{ node.timeStamp }}
            </div>
            <button
              class="complete-button"
              @click.stop="toggleComplete"
              :class="{ completed: node.completed === 1 }"
            >
              ✓
            </button>
            <button
              class="action-button comment-button"
              @click.stop="toggleComment"
              :class="{ 'has-comment': node.comment }"
            >
              备注
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
            :placeholder="'开始规划蓝图'"
            @focus="editing = true"
            @blur="editing = false"
            @input="autoResize"
            rows="1"
            style="resize: none; overflow: hidden"
            :class="{ completed: node.completed === 1 }"
            spellcheck="false"
          ></textarea>
        </div>
        <button
          class="action-button add-button"
          @click.stop="addChild"
          :class="{ completed: node.completed === 1 }"
        >
          +
        </button>
      </div>
      <div class="comment-container">
        <TaskBlueprintCommentNode
          v-model:comment="node.comment"
          :show-comment="showComment"
        />
      </div>
    </div>

    <div class="children" v-if="node.children && node.children.length > 0">
      <div class="connector"></div>
      <div class="children-nodes">
        <TaskBlueprintNode
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
import TaskBlueprintCommentNode from "./TaskBlueprintCommentNode.vue";

export default {
  name: "TaskBlueprintNode",
  components: {
    TaskBlueprintCommentNode,
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
      showComment: this.node.comment ? true : false,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.autoResize();
    });
  },
  methods: {
    addChild() {
      this.$emit("add-child", this.node.id);
    },
    autoResize() {
      const textarea = this.$refs.textarea;
      if (textarea == null) return;
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    },
    moveUp() {
      this.$emit("move-node", { nodeId: this.node.id, direction: -1 });
    },
    moveDown() {
      this.$emit("move-node", { nodeId: this.node.id, direction: 1 });
    },
    toggleComplete() {
      this.node.completed = this.node.completed === 1 ? 0 : 1;
    },
    hideNode() {
      this.node.hidden = 1 - this.node.hidden;
    },
    toggleComment() {
      this.showComment = !this.showComment;
    },
  },
};
</script>

<style scoped>
.task-tree-node {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.node-self {
  display: flex;
  align-items: flex-start;
}

.comment-container {
  display: flex;
  align-items: flex-start;
}

.highlight {
  animation: pulse 5s ease infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(124, 179, 241, 0.7);
  }
  70% {
    box-shadow: 0 0 0 100px rgba(0, 122, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 122, 255, 0);
  }
}

.node-content {
  min-width: 370px;
  display: flex;
  align-items: stretch;
  gap: 0;
  background-color: #a8c6e6;
  border-radius: 4px;
  width: fit-content;
  position: relative;
  overflow: hidden;
  transition: background-color 0.3s ease;
}

.completed-success {
  background-color: #87a1e3;
}

.time-stamp.completed {
  color: #fef668;
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
  background-color: #d3e5fa;
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

.time-stamp {
  text-align: left;
  border: 0px solid #ddd;
  background: transparent;
  color: white;
}

.complete-button {
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 3px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.comment-button {
  background: #4a90e2;
  color: white;
  border: none;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.comment-button.has-comment {
  background: #3a7bc8;
  font-weight: bold;
}

.comment-button:hover {
  background: #3a7bc8;
}

.comment-button.has-comment:hover {
  background: #2a6cb8;
}

.complete-button:hover {
  background: #3a7bc8;
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
  background: #3e6e8e;
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
  height: 20px;
  width: 21px;
  background-color: #4a90e2;
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 3px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: background 0.2s;
}

.hide-button:hover {
  background-color: #3a7bc8;
}

.add-button {
  background: #4a90e2;
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
  background: #3a7bc8;
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
  border-left: 2px solid #5996b9;
  border-bottom: 1px solid #5996b9;
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