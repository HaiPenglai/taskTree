<!-- src\components\rest-list\RestList.vue -->
<template>
  <div 
    class="rest-list" 
    v-show="visible" 
    @contextmenu.prevent="hideList"
    :style="{
      left: position.x + 'px',
      top: position.y + 'px',
      transform: 'translate(-50%, -50%)'
    }"
  >
    <button class="delete-button" @click="hideList">
      <span class="delete-icon">×</span>
    </button>
    <div class="rest-list-header">
      <div class="header-left">
        <div class="date-display">{{ date }}</div>
        <div class="total-time">{{ formatTotalTime }}</div>
        <button class="add-button" @click="addNode">+</button>
      </div>
    </div>
    <div class="rest-list-content">
      <RestListNode
        v-for="node in restList"
        :key="node.id"
        :node="node"
        @delete-node="deleteNode"
      />
    </div>
  </div>
</template>

<script>
import RestListNode from "./RestListNode.vue";
import axios from "axios";

export default {
  name: "RestList",
  components: {
    RestListNode,
  },
  props: {
    userId: {
      type: Number,
      required: true,
    },
    visible: {
      type: Boolean,
      default: false,
    },
    date: {
      type: String,
      required: true,
    },
    position: {
      type: Object,
      required: true,
      default: () => ({ x: 0, y: 0 })
    }
  },
  data() {
    return {
      restList: [{
        id: Date.now(),
        text: "休息一下",
        restTime: 0,
        waitTime: 10,
        remainingTime: 0,
        timer: null
      }],
    };
  },
  computed: {
    formatTotalTime() {
      const totalSeconds = this.restList.reduce((sum, node) => sum + node.restTime, 0);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    },
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.loadRestList();
      }
    },
    date() {
      this.hideList();
    },
    restList: {
      handler() {
        this.saveRestList();
      },
      deep: true,
    },
  },
  methods: {
    async loadRestList() {
      try {
        const response = await axios.get(`/api/rest-list/${this.userId}/${this.date}`);
        if (response.data.success) {
          this.restList = response.data.restList;
        }
      } catch (error) {
        console.error("加载休息清单失败:", error);
      }
    },
    async saveRestList() {
      try {
        await axios.post(`/api/rest-list/${this.userId}/${this.date}`, {
          restList: this.restList,
        });
      } catch (error) {
        console.error("保存休息清单失败:", error);
      }
    },
    addNode() {
      const newNode = {
        id: Date.now(),
        text: "",
        restTime: 0,
        waitTime: 10,
        remainingTime: 0,
        timer: null
      };
      this.restList.push(newNode);
    },
    deleteNode(nodeId) {
      const index = this.restList.findIndex((node) => node.id === nodeId);
      if (index !== -1) {
        this.restList.splice(index, 1);
      }
    },
    hideList() {
      this.$emit('update:visible', false);
    },
  },
};
</script>

<style scoped>
.rest-list {
  position: fixed;
  background-color: #fff5f7;
  border-radius: 8px;
  padding: 12px 16px;
  width: 420px;
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.rest-list-header {
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #ffb6c1;
  padding-right: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-display {
  font-size: 16px;
  font-weight: bold;
  color: #ff69b4;
}

.total-time {
  font-family: monospace;
  background-color: #ffb6c1;
  padding: 4px 8px;
  border-radius: 4px;
  color: white;
  font-weight: bold;
}

.add-button {
  background: #ff69b4;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  margin-left: 4px;
}

.add-button:hover {
  background: #ff1493;
}

.rest-list-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-right: 16px;
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
</style> 