<!-- src\components\rest-list\RestListNode.vue -->
<template>
  <div class="rest-list-node">
    <div class="node-content">
      <div class="node-footer">
        <div class="footer-left">
          <div class="time-display">{{ formatTime(node.restTime) }}</div>
          <button
            class="action-button timer-button"
            @click="toggleTimer"
            :class="{ 'timer-running': timerRunning }"
          >
            {{ timerRunning ? '暂停' : '开始' }}
          </button>
        </div>
      </div>
      <textarea
        v-model="node.text"
        ref="textarea"
        class="node-text"
        :placeholder="'添加休息活动'"
        @focus="editing = true"
        @blur="editing = false"
        @input="autoResize"
        rows="1"
        style="resize: none; overflow: hidden"
      ></textarea>
    </div>
    <button class="delete-button" @click="$emit('delete-node', node.id)">
      <span class="delete-icon">×</span>
    </button>
  </div>
</template>

<script>
export default {
  name: "RestListNode",
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      editing: false,
      timerRunning: false,
      timerInterval: null,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.autoResize();
    });
  },
  methods: {
    autoResize() {
      const textarea = this.$refs.textarea;
      if (textarea == null) return;
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    },
    toggleTimer() {
      if (this.timerRunning) {
        clearInterval(this.timerInterval);
        this.timerRunning = false;
      } else {
        this.timerRunning = true;
        this.timerInterval = setInterval(() => {
          this.node.restTime += 1;
        }, 1000);
      }
    },
    formatTime(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
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
.rest-list-node {
  position: relative;
  background-color: #ffd6e0;
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 8px;
  width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: visible;
}

.node-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.node-text {
  border: none;
  padding: 4px;
  background-color: #fff0f5;
  font-size: 15px;
  font-weight: 200;
  outline: none;
  width: 100%;
  color: #444;
  border-radius: 4px;
  margin-top: 4px;
}

.node-text:placeholder {
  color: #888;
}

.node-footer {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-display {
  min-width: 80px;
  text-align: center;
  background-color: #ffb6c1;
  padding: 4px 8px;
  border-radius: 3px;
  color: white;
  font-weight: bold;
  font-family: monospace;
}

.timer-button {
  background: #ff69b4;
  color: white;
  border: none;
  padding: 4px 12px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;
}

.timer-button:hover {
  background: #ff1493;
}

.timer-button.timer-running {
  background: #c71585;
}

.delete-button {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 22px;
  height: 22px;
  border-bottom-left-radius: 100%;
  border: none;
  color: rgb(182, 180, 180);
  background-color: transparent;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  z-index: 1;
  transition: background-color 0.2s ease;
}

.delete-icon {
  line-height: 1;
  margin-top: -2px;
}
</style> 