var Backbone = require('backbone'),
	wp = require('wp'),
	sui = require('sui-utils/sui'),
	Shortcodes = require('sui-collections/shortcodes');

var MediaController = wp.media.controller.State.extend({

	initialize: function(){

		this.props = new Backbone.Model({
			currentShortcode: null,
			action: 'select',
			search: null,
			insertCallback: this.insertCallback,
			editor: window.wpActiveEditor ? window.wpActiveEditor : null,
		});

		this.props.on( 'change:action', this.refresh, this );
		this.on( 'activate', this.activate, this );

	},

	activate: function() {
		var $el = this.frame.$el;
		_.defer( function() { $el.addClass( 'hide-router' ); } );
	},

	refresh: function() {
		if ( this.frame && this.frame.toolbar ) {
			this.frame.toolbar.get().refresh();
		}
	},

	search: function( searchTerm ) {
		var pattern = new RegExp( searchTerm, "gi" );
		var filteredModels = sui.shortcodes.filter( function( model ) {
			pattern.lastIndex = 0;
			return pattern.test( model.get( "label" ) );
		});
		return filteredModels;
	},

	insert: function() {
		var shortcode      = this.props.get( 'currentShortcode' );
		var insertCallback = this.props.get( 'insertCallback' );

		this.setActiveEditor( this.props.get( 'editor' ) );

		if ( shortcode && insertCallback ) {
			insertCallback( shortcode );
		}

		this.reset();
		this.frame.close();
	},

	insertCallback: function( shortcode ) {
		window.send_to_editor( shortcode.formatShortcode() );
	},

	reset: function() {
		this.props.set( 'action', 'select' );
		this.props.set( 'currentShortcode', null );
		this.props.set( 'search', null );
		this.props.set( 'insertCallback', this.insertCallback );

		var menuItem = this.frame.menu.get().get('shortcode-ui');

		if ( menuItem ) {
			menuItem.options.text = shortcodeUIData.strings.media_frame_title;
			menuItem.render();
		}

		this.frame.setState( 'insert' );
		this.frame.uploader.uploader.uploader.init();
	},

	setActionSelect: function() {
		this.attributes.title = shortcodeUIData.strings.media_frame_menu_insert_label;
		this.props.set( 'currentShortcode', null );
		this.props.set( 'action', 'select' );

		// Update menuItem text.
		var menuItem = this.frame.menu.get().get('shortcode-ui');
		menuItem.options.text = this.attributes.title;
		menuItem.render();

		this.frame.setState( 'shortcode-ui' );
		this.frame.render();
	},

	setActionUpdate: function( currentShortcode ) {

		this.attributes.title = shortcodeUIData.strings.media_frame_menu_update_label;
		this.attributes.title = this.attributes.title.replace( /%s/, currentShortcode.attributes.label );

		this.props.set( 'currentShortcode', currentShortcode );
		this.props.set( 'action', 'update' );

		// If a new frame is being created, it may not exist yet.
		// Defer to ensure it does.
		_.defer( function() {

			this.frame.setState( 'shortcode-ui' );
			this.frame.content.render();

			this.toggleSidebar( true );

			this.frame.once( 'close', function() {
				this.frame.mediaController.toggleSidebar( false );
				/* Trigger render_closed */
				/*
				 * Action run after the shortcode overlay is closed.
				 *
				 * Called as `shortcode-ui.render_closed`.
				 *
				 * @param shortcodeModel (object)
				 *		   Reference to the shortcode model used in this overlay.
				 */
				var hookName = 'shortcode-ui.render_closed';
				var shortcodeModel = this.frame.mediaController.props.get( 'currentShortcode' );
				wp.shortcake.hooks.doAction( hookName, shortcodeModel );

			}.bind( this ) );

			/*
			 * Action run after an edit shortcode overlay is rendered.
			 *
			 * Called as `shortcode-ui.render_edit`.
			 *
			 * @param shortcodeModel (object)
			 *		   Reference to the shortcode model used in this overlay.
			 */
			var hookName = 'shortcode-ui.render_edit';
			wp.shortcake.hooks.doAction( hookName, currentShortcode );

		}.bind( this ) );

	},

	toggleSidebar: function( show ) {
		this.frame.$el.toggleClass( 'hide-menu', show );
	},

	setActiveEditor: function( editorId ) {
		var editor = tinymce.get( editorId );

		if ( editor ) {
			tinymce.setActive( editor );
		}

		window.wpActiveEditor = editorId;
	},
});

sui.controllers.MediaController = MediaController;
module.exports = MediaController;
