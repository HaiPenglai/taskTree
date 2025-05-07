<!-- src\App.vue -->
<template>
  <div id="app">
    <TaskBox />
  </div>
</template>

<script>
import TaskBox from './components/TaskBox.vue'

export default {
  name: 'App',
  components: {
    TaskBox
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