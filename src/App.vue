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
    padding: 20px;
    background: #f0f0f0;
    font-family: Arial;
  }
  </style>