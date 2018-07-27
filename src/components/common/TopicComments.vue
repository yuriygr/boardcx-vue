<template>
	<div class="topic__comments">
		<a name="comments" id="comments"></a>
		<div class="topic__comments__title">{{ count | ommited }}</div>
		<div class="topic__comments__container">
			<span v-if="count <= 0">
				There are no comments
			</span>
			<comment v-for="(comment, index) in comments"
				:key="comment.id"
				:comment="comment"
				:index="++index"
				:canModerate="canModerate"
				depth="0" />
		</div>
		<comment-form />
	</div>
</template>

<script>
	import Comment from '@/components/common/Comment'
	import CommentForm from '@/components/common/CommentForm'

	export default {
		name: 'topic-comments',
		props: [ 'comments', 'count', 'canModerate' ],
		components: {
			Comment,
			CommentForm
		}
	}
</script>