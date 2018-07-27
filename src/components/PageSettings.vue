<template>
	<section class="content">
		<h1 class="page__title">Settings</h1>
		<div class="page__content">
			<form action="/" class="form" @submit.prevent="saveSetting">
				<div class="form__group form__group--select">
					<label class="form__label">Theme</label>
					<select
						name="theme"
						:value="settings.get('theme', 'base')"
						@change="changeSetting">
						<option value="base">Base</option>
						<option value="dark">Dark</option>
						<option value="tommorow">Tommorow</option>
						<option value="burichan">Burichan</option>
						<option value="futaba">Futaba</option>
						<option value="kusaba">Kusaba</option>
						<option value="win95">Windows 95</option>
						<option value="imgur">Imgur</option>
					</select>
					<div class="form__desc">Cool and diverse themes specifically for you.</div>
				</div>
				<div class="form__group form__group--checkbox">
					<label class="form__label">
						<input
							:value="settings.get('auto_refresh')"
							:checked="settings.get('auto_refresh')"
							@change="changeSetting"
							name="auto_refresh"
							type="checkbox"> Automatic refresh topics
					</label>
					<div class="form__desc">We will press the button "Refresh" for you.</div>
				</div>
				<div class="form__group form__group--checkbox">
					<label class="form__label">
						<input
							:value="settings.get('remove_hidden')"
							:checked="settings.get('remove_hidden')"
							@change="changeSetting"
							name="remove_hidden"
							type="checkbox"> Don't show hidden topics
					</label>
					<div class="form__desc">Hidden topics will not even be displayed.</div>
				</div>
				<div class="form__group form__group--checkbox">
					<label class="form__label">
						<input
							:value="settings.get('hide_files')"
							:checked="settings.get('hide_files')"
							@change="changeSetting"
							name="hide_files"
							type="checkbox"> Hide files thumbs
					</label>
					<div class="form__desc">Preview files will be visible only when you hover them.</div>
				</div>
				<div class="form__group form__group--checkbox">
					<label class="form__label">
						<input
							:value="settings.get('open_image_on_window')"
							:checked="settings.get('open_image_on_window')"
							@change="changeSetting"
							name="open_image_on_window"
							type="checkbox"> Open image in a new window 
					</label>
					<div class="form__desc">By clicking on the image it will open in a new window.</div>
				</div>
				<div class="form__group form__group--checkbox">
					<label class="form__label">
						<input
							:value="settings.get('fixed_header')"
							:checked="settings.get('fixed_header')"
							@change="changeSetting"
							name="fixed_header"
							type="checkbox"> Make site header fixed 
					</label>
					<div class="form__desc">Convenient, probably.</div>
				</div>
				<div class="form__group form__group--checkbox">
					<label class="form__label">
						<input
							:value="settings.get('i_hate_rounded_borders')"
							:checked="settings.get('i_hate_rounded_borders')"
							@change="changeSetting"
							name="i_hate_rounded_borders"
							type="checkbox"> Make rounded edges straight 
					</label>
					<div class="form__desc">I think some need it. I'm right?</div>
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
	</section>
</template>

<script>
	import settings from 'board-settings'
	import api from 'board-api'
	import BusEvents from 'bus-events'

	export default {
		name: 'page-settings',
		data() {
			return {
				titlePage: 'Settings',

				settings: settings,
				localSettings: settings.list()
			}
		},
		metaInfo() {
			return { title: this.titlePage }
		},
		methods: {
			changeSetting(e) {
				if (e.target.type === "checkbox")
					this.localSettings[e.target.name] = !this.localSettings[e.target.name]
				else
					this.localSettings[e.target.name] = e.target.value

				settings.update(this.localSettings, _ => {
					console.log('Settings saved')
				})
			},
			saveSetting() {
				this.$bus.emit(BusEvents.ALERTS_INFO, 'You not needs save settings, his saveing automatic, dude')
			},
			exportSettings() {
				api.settings.export(this.localSettings, 'key')
				.then((data) => {
					this.$bus.emit(BusEvents.ALERTS_SUCCESS, 'Settings exported')
				})
				.catch((error) => {
					this.$bus.emit(BusEvents.ALERTS_ERROR, 'Error: ' + error)
				})
			},
			importSettings() {
				api.settings.import('key')
				.then((data) => {
					this.localSettings = data
					this.$bus.emit(BusEvents.ALERTS_SUCCESS, 'Settings imported')
				})
				.catch((error) => {
					this.$bus.emit(BusEvents.ALERTS_ERROR, 'Error: ' + error)
				})
			},
			resetSettings() {
				settings.reset(_ => {
					this.settings = settings
					this.localSettings = settings.list()
					this.$bus.emit(BusEvents.ALERTS_SUCCESS, 'Settings was reset')
				})
			}
		}
	}
</script>