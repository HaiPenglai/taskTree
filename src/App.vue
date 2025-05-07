<!-- src\App.vue -->
<template>
  <div id="app">
    <TaskTree />
  </div>
</template>

<script>
import TaskTree from './components/TaskTree.vue'

export default {
  name: 'App',
  components: {
    TaskTree
  }
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  background: #fff8e1; /* 很浅的叶黄色 */
  font-family: Arial;
}
</style>