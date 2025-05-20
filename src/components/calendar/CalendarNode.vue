<!-- src/components/calendar/CalendarNode.vue -->
<template>
  <div class="calendar-node">
    <div class="node-content">
      <div class="time-input-container">
        <input
          type="number"
          v-model.number="hours"
          class="time-input hours"
          min="0"
          max="23"
          :disabled="node.isTriggered"
          @blur="updateTime"
          @keyup.enter="updateTime"
        />
        <span class="time-separator">:</span>
        <input
          type="number"
          v-model.number="minutes"
          class="time-input minutes"
          min="0"
          max="59"
          :disabled="node.isTriggered"
          @blur="updateTime"
          @keyup.enter="updateTime"
        />
      </div>
      <textarea
        v-model="node.text"
        ref="textarea"
        class="node-text"
        :placeholder="'添加事件描述'"
        @focus="editing = true"
        @blur="editing = false; onBlur()"
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
  name: 'CalendarNode',
  props: {
    node: {
      type: Object,
      required: true
    }
  },
  data() {
    const [hours, minutes] = this.node.time.split(':').map(Number);
    return {
      editing: false,
      hours: hours || 0,
      minutes: minutes || 0
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
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    },
    onBlur() {
      this.$emit('update:node', this.node);
    },
    updateTime() {
      // 确保小时和分钟在有效范围内
      this.hours = Math.max(0, Math.min(23, this.hours || 0));
      this.minutes = Math.max(0, Math.min(59, this.minutes || 0));
      
      // 格式化时间为 HH:MM
      const formattedHours = String(this.hours).padStart(2, '0');
      const formattedMinutes = String(this.minutes).padStart(2, '0');
      this.node.time = `${formattedHours}:${formattedMinutes}`;
      this.$emit('update:node', this.node);
    }
  },
  watch: {
    'node.time'(newVal) {
      const [hours, minutes] = newVal.split(':').map(Number);
      this.hours = hours;
      this.minutes = minutes;
    }
  }
};
</script>

<style scoped>
.calendar-node {
  position: relative;
  background-color: #fff0e0;
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 8px;
  width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: visible;
}

.node-content {
  height: 70px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time-input-container {
  display: flex;
  align-items: center;
  gap: 2px;
}

.time-input {
  font-family: monospace;
  font-size: 14px;
  color: #ff8c00;
  font-weight: bold;
  border: 1px solid #ffb366;
  border-radius: 3px;
  padding: 2px 4px;
  background-color: transparent;
  outline: none;
  text-align: center;
}

.time-input.hours {
  width: 30px;
}

.time-input.minutes {
  width: 35px;
}

.time-separator {
  color: #ff8c00;
  font-weight: bold;
  font-size: 14px;
  margin: 0 1px;
}

.time-input:disabled {
  border-color: transparent;
  background-color: transparent;
  cursor: not-allowed;
}

.time-input:focus {
  border-color: #ff8c00;
  background-color: #fff5e6;
}

/* 移除数字输入框的上下箭头 */
.time-input::-webkit-inner-spin-button,
.time-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.calendar-node.active {
  background-color: #ffb366;
  color: white;
}

.calendar-node.active .time-input {
  color: white;
  border-color: rgba(255, 255, 255, 0.5);
}

.calendar-node.active .time-input:focus {
  border-color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

.calendar-node.active .time-separator {
  color: white;
}

.calendar-node.active .node-text {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.node-text {
  border: none;
  padding: 4px;
  min-height: 35px;
  background-color: #fff5e6;
  font-size: 14px;
  outline: none;
  width: 100%;
  color: #666;
  border-radius: 4px;
}

.node-text:placeholder {
  color: #ffb366;
}

.delete-button {
  position: absolute;
  top: 0px;
  right: 0px;
  width: 22px;
  height: 22px;
  border-bottom-left-radius: 100%;
  background-color: #ff8c00;
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
  background-color: #ff6b00;
}

.delete-icon {
  line-height: 1;
  margin-top: -5px;
  margin-right: -5px;
}
</style> 