<template>
	<div :id="'comments-' + topic_id">
		<comment v-for="(comment, index) in comments"
			:key="comment.id"
			:comment="comment"
			:index="++index"
			:canModerate="canModerate"
			depth="0" />
		<comment-form />
	</div>
</template>

<script>
	import Comment from '@/components/common/Comment'
	import CommentForm from '@/components/common/CommentForm'

	export default {
		name: 'topic-comments',
		props: ['topic_id', 'comments', 'canModerate' ],
		components: {
			Comment,
			CommentForm
		}
	}
</script>