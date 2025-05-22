 <!-- src\components\task-blueprint\TaskBlueprintCommentNode.vue -->
<template>
    <div class="comment-node" v-if="showComment">
      <textarea
        ref="textarea"
        v-model="commentText"
        class="comment-textarea"
        placeholder="蓝图备注"
        @input="autoResize"
        rows="1"
        style="resize: none; overflow: hidden"
        spellcheck="false"
      ></textarea>
    </div>
  </template>
  
  <script>
  export default {
    name: "TaskBlueprintCommentNode",
    props: {
      comment: {
        type: String,
        default: ""
      },
      showComment: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        commentText: this.comment,
      };
    },
    watch: {
      comment(newVal) {
        this.commentText = newVal;
        this.$nextTick(() => {
          this.autoResize();
        });
      },
      commentText(newVal) {
        this.$emit("update:comment", newVal);
      },
      showComment(newVal) {
        if (newVal) {
          this.$nextTick(() => {
            this.autoResize();
          });
        }
      }
    },
    mounted() {
      if (this.showComment) {
        this.$nextTick(() => {
          this.autoResize();
        });
      }
    },
    methods: {
      autoResize() {
        const textarea = this.$refs.textarea;
        if (!textarea) return;
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }
  };
  </script>
  
  <style scoped>
  .comment-node {
    margin-left: 10px;
    width: 350px;
    flex-grow: 1;
  }
  
  .comment-textarea {
    width: 100%;
    padding: 8px;
    border: none;
    border-radius: 4px;
    background-color: #e1f5ff;
    color: #555;
    font-size: 14px;
    outline: none;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .comment-textarea:focus {
    background-color: #c9ebff;
  }
  </style>