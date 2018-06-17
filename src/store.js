import Vue from 'vue'
import Vuex from 'vuex'

import * as api from 'create-api'

Vue.use(Vuex)

const state = {
	name: 'board.cx',
	version: '1.3.0',
	loading: false,

	settings: JSON.parse(localStorage.getItem('settings')) || {},

	sortList: [
		{ slug: 'new', label: '✔️ New', description: 'by created time' },
		{ slug: 'top', label: '🏆 Top' },
		{ slug: 'hot', label: '🔥 Hot', description: 'by last comment time' },
		//{ slug: 'best', label: '🥇 Best' },
		{ slug: 'gallery', label: '🖼 Gallery', description: 'only files' }
	],

	// Tags
	tagsList: [],
	showTagsList: JSON.parse(localStorage.getItem('hidden.tagsList') || true),
	tagActive: false,
	tagsHidden: JSON.parse(localStorage.getItem('hidden.tags')) || [],

	// Topics
	topicsList: false,
	topicActive: false,

	// Other
	pageActive: false,
	galleryList: false
}

const mutations = {
	// App
	SET_LOADING (state, payload) {
		state.loading = payload
	},
	SET_SETTING (state, payload) {
		state.settings = { ...state.settings, [payload.type]: payload.value }
	},
	RESET_SETTINGS (state, payload) {
		state.settings = {}
	},

	// Topic
	SET_TOPICS(state, payload) {
		state.topicsList = payload.topics_data
	},
	REMOVE_TOPICS(state) {
		state.topicsList = false
	},
	SET_TOPIC(state, payload) {
		state.topicActive = payload.topic_data
	},
	REMOVE_TOPIC(state) {
		state.topicActive = false
	},

	// Refresh topic
	REFRESH_TOPIC (state, payload) {
		state.topicActive.comments.push(...payload.comments_data)
		state.topicActive.countComments = state.topicActive.comments.length
	},
	REFRESH_TOPIC_BUMP (state, payload) {
		let last_comment_index = payload.comments_data.length - 1
		state.topicActive.bump = payload.comments_data[last_comment_index].timestamp
	},

	// Comments
	PIN_COMMENT(state, payload) {
		console.log(payload)
	},
	REMOVE_COMMENT(state, payload) {
		state.topicActive.comments = state.topicActive.comments.filter(e => e.id !== payload.comment_id)
		state.topicActive.countComments = state.topicActive.comments.length
	},

	// Pages
	SET_PAGE_ACTIVE (state, payload) {
		state.pageActive = payload.page_data
	},
	REMOVE_PAGE_ACTIVE (state) {
		state.pageActive = false
	},

	// Gallery
	SET_GALLERY_LIST (state, payload) {
		state.galleryList = payload.gallery_data
	},
	REMOVE_GALLERY_LIST (state) {
		state.galleryList = false
	},

	// Tags list
	SET_TAGS(state, payload) {
		state.tagsList = payload.tags_data
	},
	REMOVE_TAGS(state) {
		state.tagsList = false
	},
	HIDE_TAG(state, payload) {
		state.tagsHidden.push(payload.slug)
	},
	UNHIDE_TAG(state, payload) {
		state.tagsHidden = state.tagsHidden.filter(e => e !== payload.slug)
	},
	RESET_HIDE_TAGS(state) {
		state.tagsHidden = []
	},

	SET_TAG_ACTIVE(state, payload) {
		state.tagActive = payload
	},
	REMOVE_TAG_ACTIVE(state) {
		state.tagActive = false
	},
	TOGGLE_TAGS_LIST(state, payload) {
		if (payload !== undefined)
			state.showTagsList = payload
		else
			state.showTagsList = !state.showTagsList
	},

	BUILD_REFMAP (state, payload) {
		state.topicActive.comments.forEach((comment, index) => {
			let replies = payload[comment.id]
			if (replies && replies.length > 0)
				comment.replies.push(...replies)
		})
	}
}

const actions = {
	// Topics
	FETCH_TOPICS ({ commit }, [type, tag, except, limit, page] ) {
		return api.topics.list({ type, tag, except, limit, page })
		.then((topics_data) => {
			commit('SET_TOPICS', { topics_data })
			commit('SET_TAG_ACTIVE', tag)
			return topics_data
		})
	},
	FETCH_TOPIC ({ commit }, topic_id) {
		return api.topics.item({ topic_id })
		.then((topic_data) => {
			commit('SET_TOPIC', { topic_data })
			commit('REMOVE_TAG_ACTIVE')
			return topic_data
		})
	},
	REFRESH_TOPIC ({ commit }, [topic_id, after_id]) {
		return api.topics.refresh({ topic_id, after_id })
		.then((comments_data) => {
			if (comments_data.length > 0) {
				commit('REFRESH_TOPIC', { comments_data })
				commit('REFRESH_TOPIC_BUMP', { comments_data })
			}
			return comments_data
		})
	},
	SEND_TOPIC ({ commit }, formData) {
		return api.topics.add(formData)
		.then((data) => {
			return data
		})
	},
	REPORT_TOPIC ({ commit }, formData) {
		return api.topics.report(formData)
		.then((data) => {
			return data
		})
	},
	FETCH_TOPIC_LOGS ({ commit }, topic_id) {
		return api.topics.logs({ topic_id })
		.then((logs_data) => {
			return logs_data
		})
	},
	LIKE_TOPIC ({ commit }, topic_id) {
		return api.topics.like(topic_id)
		.then((data) => {
			return data
		})
	},
	PASSWORD_TOPIC ({ commit }, formData) {
		return api.topics.password(formData)
		.then((data) => {
			return data
		})
	},

	// Gallery
	FETCH_GALLERY ({ commit }, [tag, except, limit, page] ) {
		return api.gallery.list({ tag, except, limit, page })
		.then((gallery_data) => {
			commit('SET_GALLERY_LIST', { gallery_data })
			commit('SET_TAG_ACTIVE', tag)
			return gallery_data
		})
	},

	// Page
	FETCH_PAGE ({ commit }, page_slug) {
		return api.pages.item({ page_slug })
		.then((page_data) => {
			commit('SET_PAGE_ACTIVE', { page_data })
		})
	},

	// Tags
	FETCH_TAGS ({ commit }) {
		return api.tags.list()
		.then((tags_data) => {
			commit('SET_TAGS', { tags_data })
			return tags_data
		})
	},

	// Comments
	SEND_COMMENT ({ commit }, formData) {
		return api.comments.add(formData)
		.then((data) => {
			return data
		})
	},
	REPORT_COMMENT ({ commit }, formData) {
		return api.comments.report(formData)
		.then((data) => {
			return data
		})
	},

	// Modderation
	MOD_PIN_COMMENT ({ commit }, [formData, comment_id]) {
		return api.mod.pin(formData)
		.then((data) => {
			commit('PIN_COMMENT', { comment_id })
			return data
		})
	},
	MOD_DELETE_COMMENT ({ commit }, [formData, comment_id]) {
		return api.mod.delete(formData)
		.then((data) => {
			commit('REMOVE_COMMENT', { comment_id })
			return data
		})
	},

	// Settings
	UPDATE_SETTING ({ commit }, [type, value] ) {
		commit('SET_SETTING', { type, value })
	}
}

const getters = {
	getTagActive (state) {
		return state.tagsList.filter(tag => tag.slug === state.tagActive)[0] || false
	},
	settings (state) {
		return new Proxy(state.settings, {
			get(target, phrase) {
				if (phrase in target) {
					return target[phrase]
				} else {
					if (phrase == "theme") return "base"
					return false
				}
			}
		})
	}
}

const store = new Vuex.Store({
	state,
	mutations,
	actions,
	getters
})

// Подпишемся для сохранения в LS
store.subscribe((mutation, state) => {
	if (
		mutation.type === "SET_SETTING" ||
		mutation.type === "RESET_SETTINGS"
	) {
		localStorage.setItem('settings', JSON.stringify(state.settings))
	}
	if (
		mutation.type === "RESET_HIDE_TAGS" ||
		mutation.type === "HIDE_TAG" ||
		mutation.type === "UNHIDE_TAG"
	) {
		localStorage.setItem('hidden.tags', JSON.stringify(state.tagsHidden))
	}
	if (mutation.type === "TOGGLE_TAGS_LIST") {
		localStorage.setItem('hidden.tagsList', JSON.stringify(state.showTagsList))
	}
})

export default store