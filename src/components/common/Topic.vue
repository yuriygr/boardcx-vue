<template>
	<div class="topic-warp">
		<div class="topic" :class="{'topic--hidden': isHidden }">
			<template v-if="!isHidden">

				<h5 class="topic__title" v-if="topic.subject">
					{{ topic.subject }}
					<span class="topic__hash" v-if="topic.isMine && !settings.hide_hash">by {{ topic.hash }}</span>
				</h5>

				<div class="topic__files u-left" v-if="topic.files.length > 0">
					<file-block
						v-for="(file, index) in topic.files"
						:file="file"
						:key="index" />
				</div>

				<div class="topic__message" v-link-preview v-comment-preview v-html="topic.message"></div>

				<div class="u-clearfix"></div>

				<div class="topic__info">
					<span class="pinned" v-if="topic.isPinned" title="Pinned">📌</span>
					<span class="locked" v-if="topic.isLocked" title="Locked">🔒</span>
					<span class="allow_attach" v-if="!topic.allowAttach" title="Without attach">🏳️</span>
					<span class="self_moderation" v-if="topic.selfModeration" title="Self-moderation">🔐</span>
					<span class="time" :title="'Last comment time: ' + $options.filters.timeFormat(topic.bump)">
						{{ topic.timestamp | timeFormat }}
					</span>
					<span class="comments" >
						<router-link v-if="topic.countComments != 0" :to="{ name: 'topic', params: { topicId: topic.id } }">
							{{ topic.countComments | ommited }}
						</router-link>
						<router-link v-else :to="{ name: 'topic', params: { topicId: topic.id } }">
							Discuss
						</router-link>
					</span>
					<span class="views" title="Unique views">{{ topic.countViews }} views</span>
					<span class="divide" v-if="topic.tags.length > 0">|</span>
					<span class="tags" v-if="topic.tags.length > 0">
						<template  v-for="(tag, index) in topic.tags">
							<router-link :to="{ name: (!isOpen ? $route.name : 'hot'), query: { tag: tag.slug } }" :key="index">#{{ tag.title }}</router-link><template v-if="index != topic.tags.length - 1">, </template>
						</template>
					</span>
					<span class="divide">|</span>
					<span class="hide">
						<a href="#" @click="hideTopic" @click.prevent.stop>Hide</a>
					</span>
					<span class="report">
						<a href="#" @click="reportTopic" @click.prevent.stop>Report</a>
					</span>
				</div>
			</template>
			<template v-else>
				<span>Topic <router-link :to="{ name: 'topic', params: { topicId: topic.id } }" :id="topic.id">«{{ topic.subject }}»</router-link> is hidden. <a href="#" @click="restoreTopic" @click.prevent.stop>Restore</a></span>
			</template>
		</div>
		<template v-if="isOpen && !isHidden">
			<slot name="logs" />

			<div class="topic__comments" v-build-refmap>
				<slot name="comments" slot-scope="props" :canModerate="canModerate" />
			</div>

			<slot name="form"/>

			<div class="topic__navigation">
				<a href="#" class="button button--small" @click="back" @click.prevent.stop>Back</a>
				<a href="#" class="button button--small" @click="refreshTopic" @click.prevent.stop>Refresh</a>
				<a href="#" class="button button--small" @click="showLogs" @click.prevent.stop>Logs</a>
				<span class="u-right">
					<a href="#" class="button button--small" @click="reportTopic" @click.prevent.stop>Report</a>
					<template v-if="topic.selfModeration">
						<a v-if="!canModerate" href="#" class="button button--small" @click="enterPassword" @click.prevent.stop>Enter password</a>
						<a
							v-else href="#" 
							class="button button--small"
							@click="resetPassword"
							@click.prevent.stop>Reset password</a>
						<a
							v-if="canModerate"
							href="#"
							class="button button--small"
							@click="showSettings"
							@click.prevent.stop>Settings</a>
					</template>
				</span>
			</div>
		</template>
	</div>
</template>

<script>
	import { mapGetters } from 'vuex'
	import { comments } from 'create-api'
	import BusEvents from 'bus-events'
	import FileBlock from './FileBlock'
	import TopicLogs from './TopicLogs'

	export default {
		name: 'topic',
		components: {
			FileBlock
		},
		props: ['topic', 'isOpen'],
		data() {
			return {
				isHidden: false,
				canModerate: false
			}
		},
		computed: {
			...mapGetters([
				'settings'
			])
		},
		created() {
			this.isHidden = this.isHiddenTopic()
			this.canModerate = this.canModerateTopic()
			// Events
			if (this.isOpen == true) {
				this.$bus.on(BusEvents.FORM_SUBMIT, () => {
					this.refreshTopic()
				})
				this.$bus.on(BusEvents.COMMENTS_PREVIEW, (data) => {
					if (data.type == 'mouseover')
						this.showPost(data)
					if (data.type == 'mouseout')
						this.removePost(data)
				})
			}
		},
		methods: {
			hideTopic() {
				this.toggleHideTopic(this.isHidden = true)
			},
			restoreTopic() {
				this.toggleHideTopic(this.isHidden = false)
			},
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
				this.$store.dispatch('REPORT_TOPIC', formData)
				.then((data) => {
					this.$bus.emit(BusEvents.ALERTS_SUCCESS, 'Report sent')
					this.$store.commit('SET_LOADING', false)
				})
				.catch((error) => {
					this.$bus.emit(BusEvents.ALERTS_ERROR, error.error_message)
					this.$store.commit('SET_LOADING', false)
				})
			},
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
			likeTopic() {
				let topicId = this.topic.id

				this.$store.commit('SET_LOADING', true)
				this.$store.dispatch('LIKE_TOPIC', topicId)
				.then((data) => {
					this.$bus.emit(BusEvents.ALERTS_SUCCESS, data.response.message)
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
			showLogs() {
				let topicId = this.topic.id

				this.$store.commit('SET_LOADING', true)
				this.$store.dispatch('FETCH_TOPIC_LOGS', topicId)
				.then((data) => {
					this.$bus.emit(BusEvents.MODAL_SHOW, TopicLogs, { logs: data })
					this.$store.commit('SET_LOADING', false)
				})
				.catch((error) => {
					this.$bus.emit(BusEvents.ALERTS_ERROR, error.error_message)
					this.$store.commit('SET_LOADING', false)
				})
			},
			showSettings() {
				let topicId = this.topic.id
				
				this.$bus.emit(BusEvents.MODAL_SHOW, TopicLogs, { logs: data })
			},
			// Hide
			toggleHideTopic(value) {
				let list = JSON.parse(localStorage.getItem('hidden.topics')) || []
				if (value)
					list.push(this.topic.id)
				else
					list = list.filter(e => e !== this.topic.id)
				localStorage.setItem('hidden.topics', JSON.stringify(list))
			},
			isHiddenTopic() {
				return (JSON.parse(localStorage.getItem('hidden.topics')) || []).indexOf(this.topic.id) != -1
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
				this.$store.dispatch('PASSWORD_TOPIC', formData)
				.then((data) => {
					// Set password on ls
					this.toggleModerationTopic("add", password)
					this.$bus.emit(BusEvents.ALERTS_SUCCESS, 'Password correct, enjoy')
					this.$store.commit('SET_LOADING', false)
				})
				.catch((error) => {
					this.$bus.emit(BusEvents.ALERTS_ERROR, error.error_message)
					this.$store.commit('SET_LOADING', false)
				})
			},
			resetPassword() {
				this.toggleModerationTopic("revoke")
			},
			toggleModerationTopic(type, password = null) {
				let list = JSON.parse(localStorage.getItem('mod.topics')) || []
				if (type == "add")
					list.push({topicId: this.topic.id, password: password})
				else
					list = list.filter(e => e !== this.topic.id)
				localStorage.setItem('mod.topics', JSON.stringify(list))
			},
			canModerateTopic() {
				return true
				return (JSON.parse(localStorage.getItem('mod.topics')) || []).indexOf(this.topic.id) != -1
			},

			/**
			 * Превью поста. BETA.
			 * Рассчитывает позиционирование и делает запрос к API
			 * TODO: не создавать костыльно элемент, а использовать компоненты.
			 */
			showPost({ e, type, params }) {

				const offset = (el, xy) => {
					let c = 0;
					while(el) {
						c += el[xy];
						el = el.offsetParent;
					}
					return c;
				}

				comments.item(params)
				.then((comment_data) => {
					let x, y,
						link = e.target,
						scrW = document.body.clientWidth || document.documentElement.clientWidth,
						scrH = window.innerHeight || document.documentElement.clientHeight

					// Положение элемента в пространстве
					x = offset(link, 'offsetLeft') + link.offsetWidth / 2
					y = offset(link, 'offsetTop')

					if (e.clientY < scrH * 0.75) y += link.offsetHeight

					let comment = document.createElement('div')
						comment.id = 'preview-' + comment_data.id
						comment.className = 'comment'
						comment.style.cssText = ('position:absolute; z-index:300; border:1px solid grey; '
						+ (x < scrW/2 ? 'left:' + x : 'right:' + parseInt(scrW - x + 2)) + 'px; '
						+ (e.clientY < scrH*0.75 ? 'top:' + y : 'bottom:' + parseInt(scrH - y - 4)) + 'px')

					let comment_message = document.createElement('div')
						comment_message.className = 'comment__message'
						comment_message.innerHTML = comment_data.message

					let comment_info = document.createElement('div')
						comment_info.className = 'comment__info'
						comment_info.innerHTML = comment_data.id + '  ' + this.$options.filters.timeFormat(comment_data.timestamp)

						comment.appendChild(comment_message)
						comment.appendChild(comment_info)
					document.querySelector('.preview').appendChild(comment)

				})
				.catch((error) => {
					console.log(error)
				})
			},
			removePost({ e, type, params }) {
				document.getElementById('preview-' + params.comment_id).remove()
			}
		},
		beforeDestroy() {
			if (this.isOpen == true) {
				// Отписались от эвентов
				this.$bus.off(BusEvents.FORM_SUBMIT)
				this.$bus.off(BusEvents.COMMENTS_PREVIEW)
				this.$bus.off(BusEvents.COMMENTS_HIGHLIGHT)
			}
		}
	}
</script>