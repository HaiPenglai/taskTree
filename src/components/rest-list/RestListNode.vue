<!-- src\components\rest-list\RestListNode.vue -->
<template>
  <div class="rest-list-node" :class="{ 'completed': node.completed }">
    <div class="node-content">
      <div class="node-footer">
        <div class="footer-left">
          <div class="time-display">{{ formatTime(node.restTime) }}</div>
          <button
            class="action-button timer-button"
            @click="toggleTimer"
            :class="{ 'timer-running': timerRunning }"
            :disabled="isWaiting || node.completed"
          >
            {{ timerRunning ? '暂停' : '开始' }}
          </button>
        </div>
        <div class="footer-right">
          <input
            type="number"
            v-model="waitMinutes"
            class="wait-input"
            value="10"
            min="1"
            max="120"
            placeholder="10"
            :disabled="isWaiting || node.completed"
          />
          <button
            class="action-button wait-button"
            @click="startWaiting"
            :disabled="isWaiting || !waitMinutes || waitMinutes < 1 || node.completed"
            :class="{ 'waiting': isWaiting }"
          >
            {{ isWaiting ? `${remainingWaitMinutes}:${remainingWaitSeconds < 10 ? '0' : ''}${remainingWaitSeconds}` : '等待' }}
          </button>
          <button
            class="action-button complete-button"
            @click="toggleComplete"
            :class="{ 'completed': node.completed }"
          >
            {{ node.completed ? '✓' : '完成' }}
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
        spellcheck="false"
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
      waitMinutes: 10,
      isWaiting: false,
      remainingWaitMinutes: 0,
      remainingWaitSeconds: 0,
      waitInterval: null,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.autoResize();
    });
  },
  beforeUnmount() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.waitInterval) {
      clearInterval(this.waitInterval);
    }
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
    startWaiting() {
      if (this.isWaiting || !this.waitMinutes || this.waitMinutes < 1) return;
      
      this.isWaiting = true;
      this.remainingWaitMinutes = parseInt(this.waitMinutes);
      this.remainingWaitSeconds = 0;
      
      this.waitInterval = setInterval(() => {
        if (this.remainingWaitMinutes <= 0 && this.remainingWaitSeconds <= 0) {
          this.stopWaiting();
          return;
        }
        
        if (this.remainingWaitSeconds <= 0) {
          this.remainingWaitMinutes--;
          this.remainingWaitSeconds = 59;
        } else {
          this.remainingWaitSeconds--;
        }
      }, 1000); // 每秒更新一次
    },
    stopWaiting() {
      this.isWaiting = false;
      this.remainingWaitMinutes = 0;
      this.remainingWaitSeconds = 0;
      if (this.waitInterval) {
        clearInterval(this.waitInterval);
        this.waitInterval = null;
      }
    },
    toggleComplete() {
      this.node.completed = !this.node.completed;
      if (this.node.completed) {
        this.stopTimer();
        this.stopWaiting();
      }
    },
    stopTimer() {
      if (this.timerRunning) {
        clearInterval(this.timerInterval);
        this.timerRunning = false;
      }
    },
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
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-right {
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

.wait-input {
  width: 35px;
  padding: 4px 8px;
  border: 1px solid #ffb6c1;
  border-radius: 3px;
  font-size: 12px;
  outline: none;
  background-color: #fff0f5;
}

.wait-input:disabled {
  background-color: rgb(251, 238, 238);
  border-color: #fbc2cb;
  cursor: not-allowed;
}

.wait-button {
  background: #ff69b4;
  color: white;
  border: none;
  padding: 4px 12px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.wait-button:hover:not(:disabled) {
  background: #ff1493;
}

.wait-button:disabled {
  background: #ffb6c1;
  cursor: not-allowed;
}

.wait-button.waiting {
  background: #c71585;
}

.timer-button:disabled {
  background: #ffb6c1;
  cursor: not-allowed;
}

.delete-button {
  position: absolute;
  top: 0px;
  right: 0px;
  width: 22px;
  height: 22px;
  border-bottom-left-radius: 100%;
  background-color: #ff69b4;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  z-index: 1;
  transition: background-color 0.2s ease;
}

.delete-button:hover {
  background-color: #ff1493;
}

.delete-icon {
  line-height: 1;
  margin-top: -5px;
  margin-right: -5px;
}

.completed {
  opacity: 0.5;
}

.complete-button {
  background: #ff69b4;
  color: white;
  border: none;
  padding: 4px 12px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.complete-button:hover {
  background: #ff1493;
}

.complete-button.completed {
  background: #fb98b4;
  opacity: 1;
}

.complete-button.completed:hover {
  background: #ee90c2;
}
</style> 