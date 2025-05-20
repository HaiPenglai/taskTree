<template>
  <div class="note-container" v-show="visible" :style="{ left: position.x + 'px', top: position.y + 'px', transform: 'translate(-50%, -50%)' }">
    <button class="delete-button" @click="close">
      <span class="delete-icon">×</span>
    </button>
    <div class="header-leaf">
      <span class="date">{{ date }}</span>
    </div>
    <textarea
      class="note-textarea"
      v-model="noteContent"
      placeholder="今天的笔记..."
      @input="saveNote"
    ></textarea>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "Note",
  props: {
    userId: { type: Number, required: true },
    date: { type: String, required: true },
    visible: { type: Boolean, default: false },
    position: { type: Object, required: true, default: () => ({ x: 0, y: 0 }) },
  },
  data() {
    return {
      noteContent: "",
      saveTimer: null,
    };
  },
  watch: {
    visible(newVal) {
      if (newVal) this.loadNote();
    },
    date(newVal, oldVal) {
      if (this.visible) this.loadNote();
    },
  },
  methods: {
    async loadNote() {
      try {
        const res = await axios.get(`/api/note/${this.userId}/${this.date}`);
        if (res.data.success) {
          this.noteContent = res.data.note;
        }
      } catch (e) {
        this.noteContent = "";
      }
    },
    saveNote() {
      if (this.saveTimer) clearTimeout(this.saveTimer);
      this.saveTimer = setTimeout(async () => {
        await axios.post(`/api/note/${this.userId}/${this.date}`, { note: this.noteContent });
      }, 500);
    },
    close() {
      this.$emit('update:visible', false);
    },
  },
  mounted() {
    if (this.visible) this.loadNote();
  },
  beforeUnmount() {
    if (this.saveTimer) clearTimeout(this.saveTimer);
  }
};
</script>

<style scoped>
.note-container {
  position: fixed;
  background-color: #fff0fa;
  border-radius: 10px;
  padding: 18px 20px 20px 20px;
  width: 420px;
  min-width: 420px;
  max-width: 90vw;
  max-height: 60vh;
  box-shadow: 0 4px 16px rgba(255, 0, 128, 0.15);
  z-index: 3000;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.header-leaf {
  background: #ff2d7a;
  color: #fff;
  font-weight: bold;
  border-radius: 6px 6px 0 0;
  padding: 8px 0 8px 16px;
  font-size: 16px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}
.date {
  font-size: 15px;
  font-weight: bold;
  letter-spacing: 1px;
}
.delete-button {
  position: absolute;
  top: 0px;
  right: 0px;
  width: 22px;
  height: 22px;
  border-bottom-left-radius: 100%;
  background-color: #ff2d7a;
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
  background-color: #c2185b;
}
.delete-icon {
  line-height: 1;
  margin-top: -5px;
  margin-right: -5px;
}
.note-textarea {
  width: 100%;
  height: 180px;
  min-height: 180px;
  max-height: 260px;
  resize: none;
  border: none;
  outline: none;
  border-radius: 6px;
  background: #ffe4f2;
  color: #333;
  font-size: 16px;
  padding: 12px;
  box-sizing: border-box;
  font-family: inherit;
  overflow-y: auto;
  margin-top: 0;
  margin-bottom: 0;
  box-shadow: 0 2px 8px rgba(255, 0, 128, 0.05);
}
.note-textarea::placeholder {
  color: #b4004e;
  opacity: 0.5;
}
</style> 