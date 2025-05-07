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
  background: #fff8e1; /* 很浅的叶黄色 */
  font-family: Arial;
}
</style>