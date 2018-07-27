<template>
	<div class="topic-form" ref="form">
		<div class="topic-form__container">
			<div
				@input="changeContent"
				@keyup="onKeyEvent"
				@keydown="onKeyEvent"
				@paste="onPaste"
				@dragenter="onDrag"
				@dragover="onDrag"
				ref="content"
				class="topic-form__content"
				contenteditable="true"
				dir="auto"
				tabindex="1"
				placeholder="Write a comment..."></div>
		</div>
		<div class="topic-form__actions">
			<button
				tabindex="2"
				class="button button--small button--action"
				@click="submitForm"
				@click.prevent.stop
				:disabled="cantSubmit">Send</button>
			<button
				v-if="allowAttach"
				class="button button--small"
				@click="attachFiles"
				@click.prevent.stop
				:disabled="cantUpload">Attach file</button>
			<input
				v-if="allowAttach"
				type="file"
				ref="file"
				@change="changeFiles"
				:accept="allowedFiles"
				:disabled="cantUpload"
				multiple
				hidden>
			<button
				class="button button--small button--link u-right"
				@click="resetForm"
				@click.prevent.stop
				:disabled="cantSubmit">Reset</button>
		</div>
		<div class="topic-form__thumbs" v-if="hasFiles">
			<div class="thumb" v-for="(file, index) in thumbsFiles" :key="index">
				<img
					class="thumb__img"
					width="100" height="100"
					draggable="false"
					v-if="file.thumb"
					:src="file.thumb"
					:alt="file.name"
					:title="file.name" />
				<a
					href="#"
					class="thumb__remove"
					title="Remove file"
					@click="removeFile(index)"
					@click.prevent.stop>×</a>
			</div>
		</div>
	</div>
</template>

<script>
	import { cancelEvent, pasteHtmlAtCaret } from 'utilities'
	import BusEvents from 'bus-events'

	export default {
		name: 'comment-form',
		data() {
			return {
				parent_id: 0,
				message: '',

				attachedFiles: [],
				thumbsFiles: [],
				allowedFiles: ['image/gif', 'image/jpeg', 'image/jpg', 'image/png'],
				limitFiles: 3
			}
		},
		created() {
			this.$bus.on(BusEvents.COMMENTS_REPLY, (data) => {
				this.moveForm(this.parent_id = data.id)
			})
		},
		computed: {
			loading() {
				return this.$store.state.loading
			},
			topic() {
				return this.$store.state.topicActive
			},
			cantSubmit() {
				return !this.message || this.loading
			},
			cantUpload() {
				return this.attachedFiles.length >= this.limitFiles || this.loading
			},
			allowAttach () {
				return this.topic.allowAttach
			},
			hasFiles() {
				return this.attachedFiles.length != 0
			}
		},
		methods: {
			submitForm() {
				if (this.cantSubmit) return

				let formData = new FormData()
					formData.append('topics_id', this.topic.id)
					formData.append('parent_id', this.parent_id)
					formData.append('message', this.message)

				this.attachedFiles.forEach(file =>
					formData.append('files[]', file)
				)

				this.$store.commit('SET_LOADING', true)
				this.$store.dispatch('SEND_COMMENT', formData)
				.then((data) => {
					this.$bus.emit(BusEvents.FORM_SUBMIT, data)
					this.resetForm()
					this.$store.commit('SET_LOADING', false)
				})
				.catch((error) => {
					this.$bus.emit(BusEvents.ALERTS_ERROR, error.error_message)
					this.$store.commit('SET_LOADING', false)
				})
			},
			attachFiles() {
				this.$refs.file.value = ''
				this.$refs.file.click()
			},

			changeContent() {
				this.message = this.$refs.content.innerText
			},
			changeFiles(event) {
				if (this.cantUpload) return
				if (!this.allowAttach) return

				let files = event.target.files || event.dataTransfer.files
				if (!files.length) return
				if (files.length > this.limitFiles) return // TODO: Проспускать меньше лимита

				for (let file in files) {
					if (!isNaN(file)) {
						let item = event.target.files[file] || event.dataTransfer.files[file]
						this.addFile(item)
					}
				}
			},
			/**
			 * Add file and his thumb to arrays
			 * @param Object file
			 */
			async addFile(file) {
				if (this.allowedFiles.indexOf(file.type) == -1) return
				
				let thumb = 'preview.png'
				this.$store.commit('SET_LOADING', true)

				if (file.type.substr(0,5) == 'image') {
					await this.createThumb(file)
					.then(data => thumb = data)
					.catch((error) => {
						this.$bus.emit(BusEvents.ALERTS_ERROR, error)
					})
				}

				// Thumb
				this.thumbsFiles.push({
					name: file.name,
					size: file.size,
					thumb: thumb,
					type: file.type
				})
				// Real file
				this.attachedFiles.push(file)

				this.$store.commit('SET_LOADING', false)
			},
			/**
			 * Create thumb from file. 
			 * @param  Object file
			 */
			createThumb(file) {
				return new Promise((resolve, reject) => {
					let reader = new FileReader()
					reader.onload = (e) => resolve(e.target.result)
					reader.onerror = (e) => reject(e.target.error)
					reader.readAsDataURL(file)
				})
			},
			/**
			 * Remove file and thumb by index from arrays
			 */
			removeFile(index) {
				this.attachedFiles.splice(index, 1)
				this.thumbsFiles.splice(index, 1)
			},

			resetForm() {
				this.parent_id = 0
				this.message = ''
				this.$refs.content.innerText = ''
				this.attachedFiles = []
				this.thumbsFiles = []
			},

			moveForm(parent_id) {
				document.querySelector('#comment-tree-' + parent_id).appendChild(this.$refs.form)
				this.$refs.content.focus()
			},

			onKeyEvent(e) {
				if (e.type == 'keydown') {
					if (e.ctrlKey && e.keyCode == 13) {
						this.submitForm()
						return cancelEvent(e)
					}
					if (e.keyCode == 13) {
						document.execCommand('insertHTML', false, '<br><br>')
						return cancelEvent(e)
					}
				}
			},
			/**
			 * Вставляет и текст и картинку. Классно короче сделана
			 */
			onPaste(e) {
				let cData = (e.originalEvent || e).clipboardData,
					items = cData && cData.items || []

				// Проверяем, не файл ли мы вставляем
				for (let i = 0; i < items.length; i++) {
					if (items[i].kind === 'file') {
						if (this.cantUpload) return cancelEvent(e)
						if (!this.allowAttach) return cancelEvent(e)
						let item = items[i].getAsFile()
						this.addFile(item)
						return cancelEvent(e)
					}
				}

				try {
					var text = cData.getData('text/plain')
				} catch (e) {
					return true
				}

				if (text.length) {
					document.execCommand('insertText', false, text)
					return cancelEvent(e)
				}

				return true
			},
			/**
			 * Запрещаем перетаскивать все в форму
			 * TODO: Драг эн дроп картинок жи есть
			 */
			onDrag(e) {
				return cancelEvent(e)
			}
		},
		beforeDestroy() {
			this.$bus.off(BusEvents.COMMENTS_REPLY)
			this.resetForm()
		}
}
</script>