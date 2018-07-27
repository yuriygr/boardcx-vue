<template>
	<div class="comment__wrapper">
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

				<div v-if="isTreeHidden" class="comment__tree__expand"><a href="#" @click="toggleHideTree" @click.prevent.stop>Restore tree</a></div>

			</template>
			<template v-else>
				<div class="comment__message">Comment #{{ comment.id }} is hidden. <a href="#" @click="toggleHideComment" @click.prevent.stop>Restore</a></div>
			</template>
		</div>
		<div class="comment__tree__wrapper" v-if="!isTreeHidden">	
			<div class="comment__tree" :id="'comment-tree-' + comment.id">
				<comment
					v-for="(comment, index) in comment.replies"
					:key="comment.id"
					:comment="comment"
					:index="++index"
					:canModerate="canModerate"
					:depth="depth + 1"/>
			</div>
			<div class="comment__tree__subthree" @click="toggleHideTree"></div>
		</div>
	</div>
</template>

<style>
	.comment {
		position: relative;
		word-break: break-word;
		padding: 8px 11px 8px 22px;
		margin-left: -22px;
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
		color: #aaa;
		cursor: pointer;
		user-select: none;
	}
	.comment__info > span.reply:hover {
		color: #056495;
	}
	.comment__info > span.options {
		position: relative;
		margin-left: auto;
		user-select: none;
	}
	.comment__info > span.options > span {
		cursor: pointer;
		user-select: none;
		font-weight: bold;
		line-height: 15px;
	}
	.comment__info > span.options--open >span { color: #2e3d48; }


	.comment__tree {
		padding-left: 22px;
		border-left: 1px dashed #ccc;
	}
	.comment__tree__wrapper:hover {
		position: relative;
	}
	.comment__tree__wrapper:hover > .comment__tree__subthree {
		display: block;
	}
	.comment__tree__subthree {
		display: none;
		position: absolute;
		width: 22px;
		height: 100%;
		left: 0;
		top: 0;
		cursor: pointer;
	}
	.comment__tree__subthree:hover {
   		border-left: 2px solid #ffb400;
	}
	.comment__tree__expand {
		color: #aaa;
		font-size: .85rem;
		user-select: none;
	}
</style>

<script>
	import BusEvents from 'bus-events'
	import hiding from 'board-hiding'
	import moderation from 'board-moderation'
	import FileBlock from '@/components/common/FileBlock'

	const TIMEOUT_DEFAULT = 3500

	export default {
		name: 'comment',
		components: {
			FileBlock
		},
		props: ['comment', 'index', 'canModerate', 'depth'],
		data() {
			return {
				isHidden: hiding.hidden({ comment_id: this.comment.id }),
				isTreeHidden: hiding.hidden({ tree_id: this.comment.id }),

				isHighlighted: false,
				showOptions: false
			}
		},
		created() {
			document.addEventListener('click', this.documentClick)
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
			documentClick(e) {
				if (this.showOptions) {
					let el = this.$refs.optionsMenu
					if (!el) return false
					let target = e.target
					if (( el !== target) && !el.contains(target))
						this.showOptions = false
				}
			},
			toggleHideComment() {
				if (this.showOptions)
					this.showOptions = false

				hiding.toggle({
					comment_id: this.comment.id,
					hide: this.isHidden ^= true
				}, _ => {})
			},
			toggleHideTree() {
				hiding.toggle({
					tree_id: this.comment.id,
					hide: this.isTreeHidden ^= true
				}, _ => {})
			},
			replyToComment() {
				this.isTreeHidden = false
				this.$bus.emit(BusEvents.COMMENTS_REPLY, this.comment)
			},
			reportComment() {
				let reason = prompt('Enter a reason for report:', '')
				if (reason == null)
					return true
				if (!reason) 
					return this.$bus.emit(BusEvents.ALERTS_ERROR, 'You must provide a reason.')

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
					formData.append('topic_id', this.comment.topics_id)
					formData.append('comment_id', this.comment.id)
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
					formData.append('topic_id', this.comment.topics_id)
					formData.append('comment_id', this.comment.id)
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
					formData.append('topic_id', this.comment.topics_id)
					formData.append('comment_id', this.comment.id)
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
		},
		beforeDestroy() {
			document.removeEventListener('click', this.documentClick)
		}
	}
</script>