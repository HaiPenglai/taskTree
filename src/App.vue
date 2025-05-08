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
  background: #fff8e1;
  font-family: Arial;
  height: 100vh;
  overflow: hidden;
}
</style>