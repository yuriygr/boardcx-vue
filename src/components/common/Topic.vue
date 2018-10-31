<template>
	<div class="topic-warp">
		<div class="topic"
			:id="'topic-' + topic.id"
			:class="{
				'topic--hidden': isHidden,
				'topic--opened': isOpen,
				'topic--moderate': canModerate
			}">
			<template v-if="!isHidden">
				<div class="topic__meta">
					<span class="time" :title="'Last comment time: ' + $options.filters.timeFormat(topic.bump)">
						{{ topic.timestamp | timeFormat }}
					</span>
					<span class="tags" v-if="topic.tags.length > 0">
						<template  v-for="(tag, index) in topic.tags">
							<router-link :to="{ name: (!isOpen ? $route.name : 'hot'), query: { tag: tag.slug } }" :key="tag.slug">#{{ tag.title }}</router-link><template v-if="index != topic.tags.length - 1">, </template>
						</template>
					</span>
					<span class="options" :class="{ 'options--open': showOptions }" @click="toggleOptionsTopic">
						<span>&middot;&middot;&middot;</span>
						<div v-if="showOptions" ref="optionsMenu" class="options-menu">
							<span class="hide">
								<a href="#" @click="toggleHideTopic" @click.prevent.stop>Hide</a>
							</span>
							<span class="report">
								<a href="#" @click="reportTopic" @click.prevent.stop>Report</a>
							</span>
							<template v-if="topic.selfModeration">
								<span class="divide"></span>
								<template v-if="canModerate">
									<span class="edit">
										<a href="#" @click="editTopic" @click.prevent.stop>Edit ß</a>
									</span>
									<span class="delete">
										<a href="#" @click="deleteTopic" @click.prevent.stop>Delete</a>
									</span>
									<span class="close" v-if="!topic.isClosed">
										<a href="#" @click="closeTopic" @click.prevent.stop>Close</a>
									</span>
									<span class="settings">
										<a href="#" @click="showSettings" @click.prevent.stop>Settings ß</a>
									</span>
									<span class="divide"></span>
									<span class="reset-password">
										<a href="#" @click="resetPassword" @click.prevent.stop>Reset password</a>
									</span>
								</template>
								<template v-else>
									<span class="enter-password">
										<a href="#" @click="enterPassword" @click.prevent.stop>Enter password</a>
									</span>
								</template>
							</template>
						</div>
					</span>
				</div>

				<h4 class="topic__title" v-if="topic.subject">
					<router-link class="topic__title__link" :to="{ name: 'topic', params: { topicId: topic.id } }" :key="topic.id">
						{{ topic.subject }}
					</router-link>
				</h4>

				<div class="topic__files u-left" v-if="topic.files.length > 0">
					<file-block
						v-for="(file, index) in topic.files"
						:file="file"
						:key="index" />
				</div>

				<div class="topic__message"
					v-crop-high-text="{
						'on': isOpen,
						'height': 150,
						'class': 'topic__message--cutted'
					}"
					v-html="topic.message">
				</div>

				<div class="u-clearfix"></div>

				<div class="topic__info">
					<span class="comments" id="comments">
						<router-link v-if="topic.countComments != 0" :to="{ name: 'topic', params: { topicId: topic.id }, hash:'#comments' }">
							{{ topic.countComments | ommited }}
						</router-link>
						<router-link v-else :to="{ name: 'topic', params: { topicId: topic.id }, hash:'#comments' }">
							Discuss
						</router-link>
					</span>
					<span class="views" title="Unique views">{{ topic.countViews }} views</span>
					<span class="state">
						<template v-if="topic.isPinned">Pinned</template>
						<template v-if="topic.isClosed">Closed</template>
						<template v-if="!topic.allowAttach">No attach</template>
						<template v-if="topic.selfModeration">Self-mod</template>
					</span>
				</div>
			</template>
			<template v-else>
				<span>Topic <b>«{{ topic.subject }}»</b> is hidden. <a href="#" @click="toggleHideTopic" @click.prevent.stop>Restore</a></span>
			</template>
		</div>

		<template v-if="isOpen && !isHidden">
			<topic-comments
				:topic_id="topic.id"
				:canModerate="canModerate"
				:comments="topic.comments"/>
	
			<div class="topic__navigation">
				<a href="#" class="button button--small" @click="refreshTopic" @click.prevent.stop>Refresh</a>
			</div>
		</template>
	</div>
</template>

<script>
	import { mapGetters } from 'vuex'
	import api from 'board-api'
	import hiding from 'board-hiding'
	import moderation from 'board-moderation'
	import BusEvents from 'bus-events'
	import FileBlock from '@/components/common/FileBlock'
	import TopicSettings from '@/components/common/TopicSettings'
	import TopicComments from '@/components/common/TopicComments'

	export default {
		name: 'topic',
		components: {
			FileBlock,
			TopicComments
		},
		props: ['topic', 'isOpen'],
		data() {
			return {
				isHidden: hiding.hidden({ topic_id: this.topic.id }),
				canModerate: moderation.can({ topic_id: this.topic.id }),

				showOptions: false
			}
		},
		created() {
			document.addEventListener('click', this.documentClick)
			document.addEventListener('keyup', this.documentKeyup)
			// Events
			if (this.isOpen == true) {
				this.$bus.on(BusEvents.FORM_SUBMIT, () => {
					this.refreshTopic()
				})
			}
		},
		methods: {
			toggleOptionsTopic() {
				this.showOptions = !this.showOptions
			},
			documentClick(e) {
				if (this.showOptions) {
					let el = this.$refs.optionsMenu
					if (!el) return false
					let target = e.target
					if (( el !== target) && !el.contains(target))
						this.showOptions = false
				}
			},
			documentKeyup(e) {
				if (this.showOptions) {
					if (e.keyCode === 27)
						this.showOptions = false
				}
			},
			// Hide
			toggleHideTopic() {
				if (this.showOptions)
					this.showOptions = false

				hiding.toggle({
					topic_id: this.topic.id,
					hide: this.isHidden ^= true
				}, _ => {})
			},

			// Report
			reportTopic() {
				let reason = prompt('Enter a reason for report:', '')
				if (reason == null) return true
				if (!reason) { 
					this.$bus.emit(BusEvents.ALERTS_ERROR, 'You must provide a reason')
					return true
				}

				let formData = new FormData()
					formData.append('topics_id', this.topic.id)
					formData.append('reason', reason)

				this.$store.commit('SET_LOADING', true)
				api.topic.report(formData)
				.then((data) => {
					this.$bus.emit(BusEvents.ALERTS_SUCCESS, 'Report sent')
					this.$store.commit('SET_LOADING', false)
				})
				.catch((error) => {
					this.$bus.emit(BusEvents.ALERTS_ERROR, error.error_message)
					this.$store.commit('SET_LOADING', false)
				})
			},
			// Refresh
			refreshTopic() {
				let topicId = this.topic.id,
					afterId = this.topic.comments.length > 0
							? this.topic.comments[this.topic.comments.length - 1].id
							: this.topic.id

				this.$store.commit('SET_LOADING', true)
				this.$store.dispatch('REFRESH_TOPIC', [topicId, afterId])
				.then((comments_data) => {
					this.$bus.emit(BusEvents.ALERTS_INFO,
						comments_data.length > 0
						? 'New comments: ' + comments_data.length
						: 'No new comments'
					)
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

			// Self-moderation
			enterPassword () {
				let password = prompt('Enter a password for topic:', '')
				if (password == null) return true
				if (!password) { 
					this.$bus.emit(BusEvents.ALERTS_ERROR, 'Password must be entered')
					return true
				}

				let formData = new FormData()
					formData.append('topics_id', this.topic.id)
					formData.append('password', password)

				this.$store.commit('SET_LOADING', true)
				api.topics.password(formData)
				.then((data) => {
					moderation.add({ topic_id: this.topic.id, password: password }, _ => {
						this.canModerate = true
						this.$bus.emit(BusEvents.ALERTS_SUCCESS, 'Password correct, enjoy')
					})
					this.$store.commit('SET_LOADING', false)
				})
				.catch((error) => {
					this.$bus.emit(BusEvents.ALERTS_ERROR, error.error_message)
					this.$store.commit('SET_LOADING', false)
				})
			},
			resetPassword() {
				moderation.revoke({ topic_id: this.topic.id }, _ => {
					this.canModerate = false
					this.$bus.emit(BusEvents.ALERTS_SUCCESS, 'Password revoked, heh')
				})
			},
			editTopic() {
				this.$bus.emit(BusEvents.ALERTS_SUCCESS, 'Puento so adios no')
			},
			deleteTopic() {
				if (!this.canModerate) return
 				if (!confirm(`Delete topic #${this.topic.id}\rAre you shure?`)) return

				let formData = new FormData()
					formData.append('topic_id', this.topic.id)
					formData.append('password', moderation.get(
						{ topic_id: this.topic.id }
					).password)

				this.$store.commit('SET_LOADING', true)
				this.$store.dispatch('MOD_DELETE_TOPIC', formData)
				.then((data) => {
					this.$bus.emit(BusEvents.ALERTS_SUCCESS, 'Topic deleted')
					this.$store.commit('SET_LOADING', false)
				})
				.catch((error) => {
					this.$bus.emit(BusEvents.ALERTS_ERROR, error.error_message)
					this.$store.commit('SET_LOADING', false)
				})
			},
			closeTopic() {
				if (!this.canModerate) return
 				if (!confirm(`Close topic #${this.topic.id}\rAre you shure?`)) return

				let formData = new FormData()
					formData.append('topic_id', this.topic.id)
					formData.append('password', moderation.get(
						{ topic_id: this.topic.id }
					).password)

				this.$store.commit('SET_LOADING', true)
				this.$store.dispatch('MOD_CLOSE_TOPIC', formData)
				.then((data) => {
					this.$bus.emit(BusEvents.ALERTS_SUCCESS, 'Topic closed')
					this.$store.commit('SET_LOADING', false)
				})
				.catch((error) => {
					this.$bus.emit(BusEvents.ALERTS_ERROR, error.error_message)
					this.$store.commit('SET_LOADING', false)
				})
			},
			showSettings() {
				this.$bus.emit(BusEvents.MODAL_SHOW, TopicSettings, { topic_id: this.topic.id })
			}
		},
		beforeDestroy() {
			document.removeEventListener('click', this.documentClick)
			document.removeEventListener('keyup', this.documentKeyup)
			if (this.isOpen == true) {
				// Отписались от эвентов
				this.$bus.off(BusEvents.FORM_SUBMIT)
				this.$bus.off(BusEvents.COMMENTS_HIGHLIGHT)
			}
		}
	}
</script>