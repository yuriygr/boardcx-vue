<template>
	<div class="comment-wrapper">
		<div class="comment"
			:id="'comment-' + comment.id"
			:class="[
				{'comment--highlighted' : isHighlighted },
				{'comment--hidden': isHidden }
			]">
			<template v-if="!isHidden">
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
					<span class="reply" @click="replyToComment" @click.prevent.stop>Reply</span>
					<span class="time">{{ comment.timestamp | timeFormat }}</span>
					<span class="options" :class="{ 'options--open': showOptions }" @click="toggleOptionsComment">
						<span>&middot;&middot;&middot;</span>
						<div v-if="showOptions" ref="optionsMenu" class="options-menu">
							<span class="hide">
								<a href="#" @click="toggleHideComment" @click.prevent.stop>Hide</a>
							</span>
							<span class="report">
								<a href="#" @click="reportComment" @click.prevent.stop>Report</a>
							</span>
							<template v-if="canModerate">
								<span class="divide"></span>
								<span class="ban">
									<a href="#" @click="banUser" @click.prevent.stop>Ban</a>
								</span>
								<span class="pin">
									<a href="#" @click="pinComment" @click.prevent.stop>Pin</a>
								</span>
								<span class="delete">
									<a href="#" @click="deleteComment" @click.prevent.stop>Delete</a>
								</span>
							</template>
						</div>
					</span>
				</div>
			</template>
			<template v-else>
				<div class="comment__message"><a href="#" @click="toggleHideComment" @click.prevent.stop>Restore</a> Comment #{{ comment.id }} is hidden.</div>
			</template>
		</div>
		<div class="comment__replies">
			<comment
				v-for="(comment, index) in comment.replies"
				:key="comment.id"
				:comment="comment"
				:index="++index"
				:canModerate="canModerate" />
			<div class="comment_replies__subthree"></div>
		</div>
	</div>
</template>

<style>
	.comment {
		position: relative;
		word-break: break-word;
	}
	.comment--hidden { opacity: .6; font-size: .85rem; }
	.comment--highlighted { box-shadow: 0px 0px 3px 1px #ffb400; }
	/* Posr File */
	.comment__files {
		display: inline-block;
		vertical-align: top;
		margin: .5rem .5rem 0 .5rem;
	}
	.comment__message {
		padding: .5rem 0 .2rem;
		line-height: 1.4;
		word-break: break-word;
	}
	.comment__info {
		color: #aaa;
		font-size: .85rem;
		padding: .2rem 0 .5rem;
	}
	.comment__info > span { margin-right: .5rem; }
	.comment__info > span.divide { color: #efefef; }
	.comment__info > span:last-child { margin-right: 0; }
	.comment__info > span.reply {
		color: #1C9BC5;
		cursor: pointer;
	}
	.comment__info > span.options {
		position: relative;
		margin-left: auto;
	}
	.comment__info > span.options > span {
		cursor: pointer;
		user-select: none;
		font-weight: bold;
		line-height: 15px;
	}
	.comment__info > span.options--open >span { color: #2e3d48; }


	.comment__replies {
		padding-left: 32px;
		border-left: 1px dashed #ccc;
	}
</style>

<script>
	import hiding from 'board-hiding'
	import moderation from 'board-moderation'
	import FileBlock from '@/components/common/FileBlock'
	import BusEvents from 'bus-events'

	const TIMEOUT_DEFAULT = 3500

	export default {
		name: 'comment',
		components: {
			FileBlock
		},
		props: ['comment', 'index', 'canModerate'],
		data() {
			return {
				isHidden: hiding.hidden({ comment_id: this.comment.id }),
				isHighlighted: false,

				showOptions: false
			}
		},
		created() {
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
			toggleOptionsComment() {
				this.showOptions = !this.showOptions
			},
			toggleHideComment() {
				if (this.showOptions)
					this.showOptions = false

				hiding.toggle({
					comment_id: this.comment.id,
					hide: this.isHidden ^= true
				}, _ => {})
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
				if (!confirm(`Ban #${this.comment.id} comment author?`))
					return true

				let formData = new FormData()
					formData.append('comment_id', this.comment.id)
					formData.append('type', 'comment')
					formData.append('password', moderation.get(
						{ topic_id: this.comment.topics_id }
					).password)

				this.$store.commit('SET_LOADING', true)
				this.$store.dispatch('MOD_BAN_COMMENT', formData)
				.then((data) => {
					this.$bus.emit(BusEvents.ALERTS_SUCCESS, 'Author banned')
					this.$store.commit('SET_LOADING', false)
				})
				.catch((error) => {
					this.$bus.emit(BusEvents.ALERTS_ERROR, error.error_message)
					this.$store.commit('SET_LOADING', false)
				})
			},
			pinComment() {
				if (!confirm(`Pin #${this.comment.id} comment?`))
					return true

				let formData = new FormData()
					formData.append('comment_id', this.comment.id)
					formData.append('type', 'comment')
					formData.append('password', moderation.get(
						{ topic_id: this.comment.topics_id }
					).password)

				this.$store.commit('SET_LOADING', true)
				this.$store.dispatch('MOD_PIN_COMMENT', formData)
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

				let formData = new FormData()
					formData.append('comment_id', this.comment.id)
					formData.append('type', 'comment')
					formData.append('password', moderation.get(
						{ topic_id: this.comment.topics_id }
					).password)

				this.$store.commit('SET_LOADING', true)
				this.$store.dispatch('MOD_DELETE_COMMENT',formData)
				.then((data) => {
					this.$bus.emit(BusEvents.ALERTS_SUCCESS, 'Comment deleted')
					this.$store.commit('SET_LOADING', false)
				})
				.catch((error) => {
					this.$bus.emit(BusEvents.ALERTS_ERROR, error.error_message)
					this.$store.commit('SET_LOADING', false)
				})
			}
		}
	}
</script>