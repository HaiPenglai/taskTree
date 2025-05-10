<!-- src\App.vue -->
<template>
  <div id="app">
    <TaskBlueprint />
    <!-- <TaskTree /> -->
  </div>
</template>

<script>
import TaskTree from './components/task-tree/TaskTree.vue';
import TaskBlueprint from './components/task-blueprint/TaskBlueprint.vue';

export default {
  name: 'App',
  components: {
    TaskTree,
    TaskBlueprint
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