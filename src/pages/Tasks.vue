<template>
  <q-page padding>
    <div class="row q-mb-md">
      <div class="col">
        Time {{ time }}s
        <q-btn
          @click="onToggleProcess"
          class="text-right"
          :icon="!processing ? 'play_arrow' : 'pause'"
        />
      </div>
    </div>
    <div class="row">
      <div class="col">
        <q-list dense bordered padding class="rounded-borders">
          <q-item
            clickable
            v-ripple
            v-for="(task, taskIndex) in tasks"
            :key="taskIndex"
          >
            <q-item-section>
              {{ task.value }}
            </q-item-section>
            <q-item-section avatar>
              <q-btn
                color="primary"
                icon="delete"
                @click="remove(taskIndex, task)"
              />
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple v-if="!tasks.length">
            <q-item-section>
              <em>Nenhuma task adicionada</em>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </q-page>
</template>

<script>
import { LoremIpsum } from 'lorem-ipsum'

export default {
  name: 'Tasks',
  data() {
    return {
      lorem: null,
      direction: 1, // -1 to backward
      time: 0,
      maxTimeout: 10,
      processing: true,
      interval: null,
      tasks: [],
    }
  },
  mounted() {
    this.prepareLoremIpsum()
    this.listeningTasks()
    this.startProcess()
  },
  methods: {
    prepareLoremIpsum() {
      this.lorem = new LoremIpsum()
    },

    listeningTasks() {
      const unsubscribe = this.$firestore
        .collection('tasks')
        .onSnapshot((snapshot) => {
          snapshot.docChanges().forEach((change) => {
            const { doc, type } = change
            if (type === 'added') {
              this.tasks.push({ value: doc.data().value, key: doc.id })
            }
          })
        })
      this.$once('hook:beforeDestroy', unsubscribe)
    },

    startProcess() {
      this.processing = true
      this.startIntervalProcess()
    },

    add() {
      this.$firestore.collection('tasks').add({
        value: this.lorem.generateWords(4),
      })
    },

    remove(index, task = { key: null }) {
      if (!this.tasks.length) {
        return
      }
      let key = task.key || null
      if (!task.key && this.tasks.length) {
        index = this.tasks.length - 1
        key = this.tasks[index].key
      }
      this.$firestore
        .collection('tasks')
        .doc(key)
        .delete()
        .then(() => this.tasks.splice(index, 1))
    },

    clearInterval() {
      clearInterval(this.interval)
    },

    onToggleProcess() {
      if (this.processing) {
        this.stopProcess()
        this.clearInterval()
        return
      }
      this.processing = true
      this.startProcess()
    },

    stopProcess() {
      this.processing = false
    },

    startIntervalProcess() {
      this.interval = setInterval(() => {
        this.processTime()
        this.processCrud()

        if (this.time === 0) {
          this.clearInterval()
          this.stopProcess()
          this.direction = 1
          return
        }

        if (this.time === this.maxTimeout) {
          this.direction = -1
        }
      }, 1000)
    },

    processCrud() {
      if (this.direction >= 0) {
        this.add()
        return
      }
      this.remove()
    },

    processTime() {
      if (this.direction > 0) {
        this.time++
        return
      }
      if (this.time > 0) {
        this.time--
      }
    },
  },
}
</script>
