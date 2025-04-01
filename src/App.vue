<template>
  <div id="app">
    <header>
      <h1>CSV to Markdown Converter</h1>
      <p>Convert your CSV question files to markdown format</p>
    </header>

    <main>
      <FileUploader />
    </main>

    <footer>
      <p>Upload a CSV file to convert questions to markdown files.</p>
    </footer>
  </div>
</template>

<script lang="ts">
import FileUploader from '@/components/FileUploader.vue'

export default {
  name: 'App',
  components: {
    FileUploader,
  },
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

header {
  text-align: center;
  margin-bottom: 40px;
  width: 100%;
}

main {
  width: 100%;
}

footer {
  margin-top: 40px;
  text-align: center;
  font-size: 14px;
  color: #666;
  width: 100%;
}
</style>
