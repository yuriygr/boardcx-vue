<template>
	<div class="comment" :id="comment.id" :class="[{'comment--highlighted' : isHighlighted }, {'comment--hidden': isHidden }]">
		<template v-if="!isHidden">
			<div class="comment__info">
				<span class="number" :title="'Index: ' + (index)">
					<b>#{{ comment.id }}</b>
				</span>
				<span class="hash" v-if="comment.hash">by {{ comment.hash }}</span>
				<span class="time u-right">{{ comment.timestamp | timeFormat }}</span>
			</div>

			<div class="comment__files u-left" v-if="comment.files.length > 0">
				<file-block
					v-for="(file, index) in comment.files"
					:file="file"
					:key="index" />
			</div>

			<div class="u-clearfix" v-if="comment.files.length >= 3"></div>

			<div class="comment__message" v-link-preview v-comment-preview v-html="comment.message"></div>
			
			<div class="u-clearfix"></div>

			<div class="comment__info">
				<span class="pinned" v-if="comment.isPinned" title="Pinned">📌</span>
				<span class="hide">
					<a href="#" @click="hideComment" @click.prevent.stop>Hide</a>
				</span>
				<span class="report">
					<a href="#" @click="reportComment" @click.prevent.stop>Report</a>
				</span>
				<span class="divide">|</span>
				<span class="ban">
					<a href="#" @click="banUser" @click.prevent.stop>Ban</a>
				</span>
				<span class="pin">
					<a href="#" @click="pinComment" @click.prevent.stop>Pin</a>
				</span>
				<span class="delete">
					<a href="#" @click="deleteComment" @click.prevent.stop>Delete</a>
				</span>
				<span class="divide" v-if="comment.replies != 0">|</span>
				<span class="replies" v-if="comment.replies != 0">
					<template v-for="(reply, index) in comment.replies">
						<router-link :to="{ name: 'topic', params: { topicId: reply.topic_id }, hash: '#' + reply.comment_id }" :key="index">>>{{ reply.from }}</router-link><template v-if="index != comment.replies.length - 1">, </template>
					</template>
				</span>
				<span class="reply u-right">
					<a href="#" @click="replyToComment" @click.prevent.stop>Reply</a>
				</span>
			</div>
		</template>
		<template v-else>
			<div class="comment__message"><a href="#" @click="restoreComment" @click.prevent.stop>Restore</a> Comment #{{ comment.id }} is hidden.</div>
		</template>
	</div>
</template>

<script>
	import FileBlock from './FileBlock'
	import BusEvents from 'bus-events'

	const TIMEOUT_DEFAULT = 3500

	export default {
		name: 'comment',
		components: {
			FileBlock
		},
		props: ['comment', 'index'],
		data() {
			return {
				replysList: [],
				isHidden: false,
				isHighlighted: false
			}
		},
		created() {
			this.isHidden = this.isHiddenComment()
			// Events
			this.$bus.on(BusEvents.COMMENTS_HIGHLIGHT, (comment_id) => {
				if (comment_id == this.comment.id) {
					this.isHighlighted = true
					setTimeout(() => {
						this.isHighlighted = false
					}, TIMEOUT_DEFAULT)
				}
			})
		},
		methods: {
			// Main actions
			hideComment() {
				this.toggleHideComment(this.isHidden = true)
			},
			restoreComment() {
				this.toggleHideComment(this.isHidden = false)
			},
			replyToComment() {
				this.$bus.emit(BusEvents.COMMENTS_REPLY, this.comment)
			},
			reportComment() {
				let reason = prompt('Enter a reason for report:', '')
				if (reason == null) return true
				if (!reason) {
					this.$bus.emit(BusEvents.ALERTS_ERROR, 'You must provide a reason.')
					return true
				}

				let comments_id = this.comment.id
				let formData = new FormData()
					formData.append('comments_id', comments_id)
					formData.append('reason', reason)

				this.$store.commit('SET_LOADING', true)
				this.$store.dispatch('REPORT_COMMENT', formData)
				.then((data) => {
					this.$bus.emit(BusEvents.ALERTS_SUCCESS, 'Report sent.')
					this.$store.commit('SET_LOADING', false)
				})
				.catch((error) => {
					this.$bus.emit(BusEvents.ALERTS_ERROR, error.error_message)
					this.$store.commit('SET_LOADING', false)
				})
			},
			// Moderate actions
			banUser() {

			},
			pinComment() {
				if (!confirm(`Pin #${this.comment.id} comment?`))
					return true
	
				let comment_id = this.comment.id
				let formData = new FormData()
					formData.append('comment_id', comment_id)
					formData.append('type', 'comment')
					formData.append('password', "test")

				this.$store.commit('SET_LOADING', true)
				this.$store.dispatch('MOD_PIN_COMMENT', [ formData, comment_id ])
				.then((data) => {
					this.$bus.emit(BusEvents.ALERTS_SUCCESS, 'Comment pinned')
					this.$store.commit('SET_LOADING', false)
				})
				.catch((error) => {
					this.$bus.emit(BusEvents.ALERTS_ERROR, error.error_message)
					this.$store.commit('SET_LOADING', false)
				})
			},
			deleteComment() {
				if (!confirm(`Delete #${this.comment.id} comment?`))
					return true

				let comment_id = this.comment.id
				let formData = new FormData()
					formData.append('comment_id', comment_id)
					formData.append('type', 'comment')
					formData.append('password', "test")

				this.$store.commit('SET_LOADING', true)
				this.$store.dispatch('MOD_DELETE_COMMENT', [ formData, comment_id ])
				.then((data) => {
					this.$bus.emit(BusEvents.ALERTS_SUCCESS, 'Comment deleted')
					this.$store.commit('SET_LOADING', false)
				})
				.catch((error) => {
					this.$bus.emit(BusEvents.ALERTS_ERROR, error.error_message)
					this.$store.commit('SET_LOADING', false)
				})
			},
			// Supports
			toggleHideComment(value) {
				let list = JSON.parse(localStorage.getItem('hidden.comments')) || []
				if (value)
					list.push(this.comment.id)
				else
					list = list.filter(e => e !== this.comment.id)
				localStorage.setItem('hidden.comments', JSON.stringify(list))
			},
			isHiddenComment() {
				return (JSON.parse(localStorage.getItem('hidden.comments')) || []).indexOf(this.comment.id) != -1
			}
		}
	}
</script>