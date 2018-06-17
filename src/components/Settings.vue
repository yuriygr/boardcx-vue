<template>
	<main class="content">
		<div class="container">
			<h1>Settings</h1>
			<form action="/" class="form" @submit.prevent="submitSettings">
				<div class="form__group form__group--select">
					<label class="form__label">Theme</label>
					<select name="theme" :value="settings.theme" @change="updateSetting">
						<option value="base">Base</option>
						<option value="dark">Dark</option>
						<option value="tommorow">Tommorow</option>
						<option value="burichan">Burichan</option>
						<option value="futaba">Futaba</option>
						<option value="kusaba">Kusaba</option>
						<option value="imgur">Imgur</option>
					</select>
					<div class="form__desc">Cool and diverse themes specifically for you.</div>
				</div>
				<div class="form__group form__group--checkbox">
					<label class="form__label">
						<input
							:value="settings.auto_refresh"
							:checked="settings.auto_refresh"
							@change="updateSetting"
							name="auto_refresh"
							type="checkbox"> Automatic refresh topics
					</label>
					<div class="form__desc">We will press the button "Refresh" for you.</div>
				</div>
				<div class="form__group form__group--checkbox">
					<label class="form__label">
						<input
							:value="settings.hide_hash"
							:checked="settings.hide_hash"
							@change="updateSetting"
							name="hide_hash"
							type="checkbox"> Hide hashes on posts
					</label>
					<div class="form__desc">All posts for you will be impersonal.</div>
				</div>
				<div class="form__group form__group--checkbox">
					<label class="form__label">
						<input
							:value="settings.hide_sticky"
							:checked="settings.hide_sticky"
							@change="updateSetting"
							name="hide_sticky"
							type="checkbox"> Hide sticky topics
					</label>
					<div class="form__desc">You will not be bothered by the sticky topics.</div>
				</div>
				<div class="form__group form__group--checkbox">
					<label class="form__label">
						<input
							:value="settings.hide_files"
							:checked="settings.hide_files"
							@change="updateSetting"
							name="hide_files"
							type="checkbox"> Hide files thumbs
					</label>
					<div class="form__desc">Preview files will be visible only when you hover them.</div>
				</div>
				<div class="form__group form__group--checkbox">
					<label class="form__label">
						<input
							:value="settings.hide_scrollbutton"
							:checked="settings.hide_scrollbutton"
							@change="updateSetting"
							name="hide_scrollbutton"
							type="checkbox"> Hide scroll top/bottom buttons
					</label>
					<div class="form__desc">If they interfere with you, why not hide it.</div>
				</div>
				<div class="form__group">
					<input
						class="button button--action"
						type="submit"
						value="Save">
					<button
						class="button"
						@click="exportSettings"
						@click.prevent.stop>Export</button>
					<button
						class="button"
						@click="importSettings"
						@click.prevent.stop>Import</button>
					<button
						class="button button--link u-right"
						@click="resetSettings"
						@click.prevent.stop>Reset</button>
				</div>
			</form>
		</div>
	</main>
</template>

<script>
	import { mapState, mapGetters } from 'vuex'
	import BusEvents from 'bus-events'

	export default {
		name: 'settings',
		data() {
			return {
				titlePage: 'Settings'
			}
		},
		metaInfo() {
			return { title: this.titlePage }
		},
		computed: {
			...mapGetters([
				'settings'
			])
		},
		methods: {
			updateSetting(e) {
				if (e.target.type === "checkbox") 
					this.$store.dispatch('UPDATE_SETTING', [ e.target.name, e.target.checked ])
				else 
					this.$store.dispatch('UPDATE_SETTING', [ e.target.name, e.target.value ])
			},
			submitSettings() {
				this.$bus.emit(BusEvents.ALERTS_INFO, 'You not needs save settings, his saveing automatic, dude')
			},
			exportSettings() {
				this.$bus.emit(BusEvents.ALERTS_ERROR, 'Not working')
			},
			importSettings() {
				this.$bus.emit(BusEvents.ALERTS_ERROR, 'Not working')
			},
			resetSettings() {
				this.$store.commit('RESET_SETTINGS')
			}
		}
	}
</script>