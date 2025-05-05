<template>
  <div class="task-box">
    <!-- 可编辑文本 -->
    <div
      class="editable-text"
      contenteditable="true"
      @blur="saveText"
      ref="editableText"
    >
      {{ taskText }}
    </div>

    <!-- 计数器 -->
    <div class="counter">
      <button @click="incrementCounter">点击计数</button>
      <span>{{ counter }}</span>
    </div>
  </div>
</template>
  
  <script>
export default {
  name: "TaskBox",
  data() {
    return {
      taskText: "点击编辑这段文字",
      counter: 0,
    };
  },
  mounted() {
    // 加载保存的文本
    const savedText = localStorage.getItem("savedText");
    if (savedText) {
      this.taskText = savedText;
      this.$refs.editableText.textContent = savedText;
    }
  },
  methods: {
    incrementCounter() {
      this.counter++;
    },
    saveText() {
      this.taskText = this.$refs.editableText.textContent;
      localStorage.setItem("savedText", this.taskText);
    },
  },
};
</script>
  
  <style scoped>
.task-box {
  width: 300px;
  min-height: 150px;
  background: #4caf50;
  color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.editable-text {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px;
  border-radius: 4px;
  min-height: 20px;
  cursor: text;
}
.counter {
  display: flex;
  align-items: center;
  gap: 10px;
}
button {
  background: white;
  color: #4caf50;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  opacity: 0.9;
}
</style>