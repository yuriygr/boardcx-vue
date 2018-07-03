<template>
	<section class="content">
		<h1 class="page__title">Start discussion</h1>
		<div class="page__content">
			<form action="/" class="form" @submit.prevent="submit" enctype="multipart/form-data">
				<div class="form__group form__group--required">
					<label class="form__label" for="subject">Subject</label>
					<input v-model="subject" type="text" id="subject" name="subject" class="input input-big">
					<div class="form__desc">Try to spell out the essence of your topic in a nutshell</div>
				</div>

				<div class="form__group form__group--required">
					<label class="form__label" for="message">Message</label>
					<textarea v-model="message" id="message" name="message" rows="5" style="resize: vertical;"></textarea>
					<div class="form__desc">Anymany text here, pleas</div>
				</div>

				<hr class="form__divide">

				<div class="form__group">
					<label class="form__label" for="file">File</label>
					<button
					class="button button--big"
					@click="attachFiles"
					@click.prevent.stop
					:disabled="cantUpload">Attach file</button>
					<div class="form__desc">JPG, PNG. Limit 5000Kb and 3 files count</div>
				</div>
				<input
					type="file"
					ref="file"
					@change="changeFiles"
					:accept="allowedFiles"
					:disabled="cantUpload"
					multiple
					hidden>
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

				<div class="form__group">
					<label class="form__label" for="tags">Tags</label>
					<input-tags :tags.sync="tags" :tagsList="tagsList"></input-tags>
					<div class="form__desc">Just select from 1 to 4 tags by clicking on it</div>
				</div>

				<hr class="form__divide">

				<div class="form__group form__group--checkbox">
					<label class="form__label">
						<input
							v-model="allow_attach"
							:true-value="0"
							:false-value="1"
							name="allow_attach"
							type="checkbox"> Disallow attachments
					</label>
					<div class="form__desc">Do not attach files to comments. Just for discussions.</div>
				</div>

				<div class="form__group form__group--checkbox">
					<label class="form__label">
						<input
							v-model="self_moderation"
							:true-value="1"
							:false-value="0"
							name="self_moderation"
							type="checkbox"> Use self-moderation in the topic
					</label>
					<div class="form__desc">You can moderate your topic by password.</div>
				</div>

				<div class="form__group form__group--required" v-if="self_moderation">
					<label class="form__label" for="password">Password</label>
					<input v-model="password" type="password" id="password" name="password" class="input input-big">
					<div class="form__desc">Password for self moderation</div>
				</div>

				<div class="form__error" v-if="error">{{ error.error_message }}</div>

				<div class="form__group">
					<input
						class="button button--action"
						type="submit"
						value="Send"
						:disabled="cantSubmit">
					<button
						class="button"
						@click="back"
						@click.prevent.stop>Cancel</button>
					<button
						class="button button--link u-right"
						@click="resetForm"
						@click.prevent.stop>Reset</button>
				</div>
			</form>
		</div>
	</section>
</template>

<script>
	import { mapState } from 'vuex'
	import api from 'board-api'
	import BusEvents from 'bus-events'
	import InputTags from '@/components/common/InputTags'

	export default {
		name: 'topic-new',
		components: {
			InputTags
		},
		data() {
			return {
				titlePage: 'Start a discussion',

				subject: '',
				message: '',
				tags: [],
				is_mine: 0,
				allow_attach: 1,
				self_moderation: 0,
				password: '',
				via: '',

				attachedFiles: [],
				thumbsFiles: [],
				allowedFiles: ['image/gif', 'image/jpeg', 'image/jpg', 'image/png'],
				limitFiles: 3,

				error: false
			}
		},
		metaInfo() {
			return { title: this.titlePage }
		},
		computed: {
			...mapState([
				'loading',
				'tagsList'
			]),
			cantSubmit() {
				return !this.subject || !this.message || this.loading || this.tags.length == 0
			},
			cantUpload() {
				return this.attachedFiles.length >= this.limitFiles || this.loading
			},
			hasFiles() {
				return this.attachedFiles.length != 0
			}
		},
		methods: {
			submit() {
				if (this.cantSubmit) return

				let formData = new FormData()
					formData.append('subject', this.subject)
					formData.append('message', this.message)
					formData.append('tags', this.tags)
					formData.append('is_mine', this.is_mine)
					formData.append('allow_attach', this.allow_attach)
					formData.append('self_moderation', this.self_moderation)

					if (!!this.self_moderation)
						formData.append('password', this.password)

					this.attachedFiles.forEach(file =>
						formData.append('files[]', file)
					)

				this.$store.commit('SET_LOADING', true)
				api.topics.add(formData)
				.then((data) => {
					this.resetForm()
					this.$router.push({ name: 'topic', params: { topicId: data.data.id } })
					this.$bus.emit(BusEvents.ALERTS_SUCCESS, 'Topic created.')
					this.$store.commit('SET_LOADING', false)
				})
				.catch((error) => {
					this.$bus.emit(BusEvents.ALERTS_ERROR, error.error_message)
					this.$store.commit('SET_LOADING', false)
				})
			},
			back() {
				this.$router.go(-1)
			},
			resetForm() {
				this.subject = ''
				this.message = ''
				this.tags = []
				this.is_mine = 0
				this.allow_attach = 1
				this.attachedFiles = []
				this.thumbsFiles = []
				if (this.error) this.error = false
			},
			/** FILES */
			attachFiles() {
				this.$refs.file.value = ''
				this.$refs.file.click()
				if (this.error) this.error = false
			},
			changeFiles(event) {
				if (this.cantUpload) return

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
					await this.createThumb(file).then(data => thumb = data).catch(error => this.error = error)
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
			}
		}
	}
</script>