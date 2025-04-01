<template>
  <div class="file-uploader">
    <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="onDrop">
      <input
        type="file"
        ref="fileInput"
        accept=".csv"
        @change="handleFileChange"
        style="display: none"
      />
      <div v-if="!isProcessing">
        <p>Click or drag and drop a CSV file here</p>
        <button class="upload-btn" @click.stop="triggerFileInput">Select File</button>
      </div>
      <div v-else class="processing">
        <p>Processing {{ selectedFile.name }}...</p>
        <div class="progress-bar">
          <div class="progress" :style="{ width: `${processProgress}%` }"></div>
        </div>
        <p>{{ processStatus }}</p>
      </div>
    </div>

    <div v-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <div v-if="conversionComplete" class="success">
      <p>Conversion complete! {{ convertedCount }} markdown files created.</p>
      <button class="download-btn" @click="downloadFiles">Download Markdown Files (ZIP)</button>
    </div>
  </div>
</template>

<script lang="ts">
import csvService from '@/services/csvService'
import markdownGenerator from '@/utils/markdownGenerator'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

export default {
  name: 'FileUploader',
  data() {
    return {
      selectedFile: null,
      isProcessing: false,
      processProgress: 0,
      processStatus: '',
      error: null,
      conversionComplete: false,
      convertedCount: 0,
      markdownFiles: [],
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click()
    },

    onDrop(event) {
      const file = event.dataTransfer.files[0]
      if (file && file.type === 'text/csv') {
        this.selectedFile = file
        this.processFile()
      } else {
        this.error = 'Please drop a CSV file.'
      }
    },

    handleFileChange(event) {
      this.error = null
      this.conversionComplete = false
      this.selectedFile = event.target.files[0]
      if (this.selectedFile) {
        this.processFile()
      }
    },

    async processFile() {
      if (!this.selectedFile) return

      this.isProcessing = true
      this.processProgress = 10
      this.processStatus = 'Parsing CSV...'
      this.markdownFiles = []

      try {
        const data = await csvService.parseCSV(this.selectedFile)
        this.processProgress = 30
        this.processStatus = `Parsed ${data.length} questions`

        for (let i = 0; i < data.length; i++) {
          const question = data[i]
          const markdown = markdownGenerator.questionToMarkdown(question)
          const filename = markdownGenerator.generateFilename(question, i)

          this.markdownFiles.push({
            filename,
            content: markdown,
          })

          this.processProgress = 30 + Math.floor((i / data.length) * 60)
          this.processStatus = `Converting question ${i + 1} of ${data.length}`
        }

        this.convertedCount = this.markdownFiles.length
        this.processProgress = 100
        this.processStatus = 'Conversion complete!'
        this.conversionComplete = true
      } catch (err) {
        this.error = `Error: ${err.message}`
        this.processProgress = 0
      } finally {
        this.isProcessing = false
      }
    },

    async downloadFiles() {
      const zip = new JSZip()

      this.markdownFiles.forEach((file) => {
        zip.file(file.filename, file.content)
      })

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      saveAs(zipBlob, 'markdown-questions.zip')
    },
  },
}
</script>

<style scoped>
.file-uploader {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;
  margin-bottom: 20px;
  width: 100%;
  box-sizing: border-box;
}

.upload-area:hover {
  border-color: #666;
}

.upload-btn,
.download-btn {
  background-color: #4caf50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  font-size: 16px;
  transition: background-color 0.2s;
}

.upload-btn:hover,
.download-btn:hover {
  background-color: #45a049;
}

.error {
  color: #f44336;
  margin: 10px 0;
  width: 100%;
  text-align: center;
}

.success {
  color: #4caf50;
  margin: 10px 0;
  width: 100%;
  text-align: center;
}

.processing {
  margin: 10px 0;
  width: 100%;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background-color: #f1f1f1;
  border-radius: 4px;
  margin: 10px 0;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.3s;
}
</style>
