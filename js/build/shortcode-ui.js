(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
var ShortcodeAttribute = require('./../models/shortcode-attribute.js');

/**
 * Shortcode Attributes collection.
 */
var ShortcodeAttributes = Backbone.Collection.extend({
	model : ShortcodeAttribute,
	//  Deep Clone.
	clone : function() {
		return new this.constructor(_.map(this.models, function(m) {
			return m.clone();
		}));
	},

});

module.exports = ShortcodeAttributes;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../models/shortcode-attribute.js":5}],2:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
var Shortcode = require('./../models/shortcode.js');

// Shortcode Collection
var Shortcodes = Backbone.Collection.extend({
	model : Shortcode
});

module.exports = Shortcodes;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../models/shortcode.js":6}],3:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null),
	wp = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null),
	sui = require('./../utils/sui.js'),
	Shortcodes = require('./../collections/shortcodes.js');

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
		menuItem.options.text = shortcodeUIData.strings.media_frame_title;
		menuItem.render();

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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../collections/shortcodes.js":2,"./../utils/sui.js":10}],4:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);

/**
 * Shortcode Attribute Model.
 */
var InnerContent = Backbone.Model.extend({
	defaults : {
		label:       shortcodeUIData.strings.insert_content_label,
		type:        'textarea',
		value:       '',
		placeholder: '',
	},
});

module.exports = InnerContent;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);

var ShortcodeAttribute = Backbone.Model.extend({

	defaults: {
		attr:        '',
		label:       '',
		type:        '',
		value:       '',
		description: '',
		encode:      false,
		meta: {
			placeholder: '',
		},
	},

});

module.exports = ShortcodeAttribute;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
var ShortcodeAttributes = require('./../collections/shortcode-attributes.js');
var InnerContent = require('./inner-content.js');
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Shortcode = Backbone.Model.extend({

	defaults: {
		label: '',
		shortcode_tag: '',
		attrs: new ShortcodeAttributes(),
		attributes_backup: {},
	},

	/**
	 * Custom set method.
	 * Handles setting the attribute collection.
	 */
	set: function( attributes, options ) {

		if ( attributes.attrs !== undefined && ! ( attributes.attrs instanceof ShortcodeAttributes ) ) {
			attributes.attrs = new ShortcodeAttributes( attributes.attrs );
		}

		if ( attributes.inner_content && ! ( attributes.inner_content instanceof InnerContent ) ) {
			attributes.inner_content = new InnerContent( attributes.inner_content );
		}

		return Backbone.Model.prototype.set.call(this, attributes, options);
	},

	/**
	 * Custom toJSON.
	 * Handles converting the attribute collection to JSON.
	 */
	toJSON: function( options ) {
		options = Backbone.Model.prototype.toJSON.call(this, options);
		if ( options.attrs && ( options.attrs instanceof ShortcodeAttributes ) ) {
			options.attrs = options.attrs.toJSON();
		}
		if ( options.inner_content && ( options.inner_content instanceof InnerContent ) ) {
			options.inner_content = options.inner_content.toJSON();
		}
		return options;
	},

	/**
	 * Custom clone
	 * Make sure we don't clone a reference to attributes.
	 */
	clone: function() {
		var clone = Backbone.Model.prototype.clone.call( this );
		clone.set( 'attrs', clone.get( 'attrs' ).clone() );
		if ( clone.get( 'inner_content' ) ) {
			clone.set( 'inner_content', clone.get( 'inner_content' ).clone() );
		}
		return clone;
	},

	/**
	 * Get the shortcode as... a shortcode!
	 *
	 * @return string eg [shortcode attr1=value]
	 */
	formatShortcode: function() {

		var template, shortcodeAttributes, attrs = [], content, self = this;

		this.get( 'attrs' ).each( function( attr ) {

			// Skip empty attributes.
			if ( ! attr.get( 'value' ) || attr.get( 'value' ).length < 1 ) {
				return;
			}

			// Encode textareas incase HTML
			if ( attr.get( 'encode' ) ) {
				attr.set( 'value', encodeURIComponent( decodeURIComponent( attr.get( 'value' ).replace( /%/g, "&#37;" ) ) ), { silent: true } );
			}

			attrs.push( attr.get( 'attr' ) + '="' + attr.get( 'value' ) + '"' );

		} );

		$.each( this.get( 'attributes_backup' ), function( key, value){
			attrs.push( key + '="' + value + '"' );
		});

		if ( this.get( 'inner_content' ) ) {
			content = this.get( 'inner_content' ).get( 'value' );
		} else if ( this.get( 'inner_content_backup' ) ) {
			content = this.get( 'inner_content_backup' );
		}

		if ( attrs.length > 0 ) {
			template = "[{{ shortcode }} {{ attributes }}";
		} else {
			template = "[{{ shortcode }}";
		}

		if ( content && content.length > 0 ) {
			template += "]{{ content }}[/{{ shortcode }}]";
		} else {
			// add closing slash to shortcodes without content
			template += " /]";
		}

		template = template.replace( /{{ shortcode }}/g, this.get('shortcode_tag') );
		template = template.replace( /{{ attributes }}/g, attrs.join( ' ' ) );
		template = template.replace( /{{ content }}/g, content );

		return template;

	},
});

module.exports = Shortcode;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../collections/shortcode-attributes.js":1,"./inner-content.js":4}],7:[function(require,module,exports){
(function (global){
var sui = require('./utils/sui.js'),
	Shortcodes = require('./collections/shortcodes.js'),
	shortcodeViewConstructor = require('./utils/shortcode-view-constructor.js'),
	mediaFrame = require('./views/media-frame.js'),
	wp = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null),
	$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

// Create collection of shortcode models from data.
sui.shortcodes.add( shortcodeUIData.shortcodes );

wp.media.view.MediaFrame.Post = mediaFrame;

// Register a view for each shortcode.
sui.shortcodes.each( function( shortcode ) {
	if ( wp.mce.views ) {
		wp.mce.views.register(
			shortcode.get('shortcode_tag'),
			shortcodeViewConstructor
		);
	}
} );

$(function(){

	$(document.body).on( 'click', '.shortcake-add-post-element', function( event ) {

		var $el     = $( event.currentTarget ),
			editor  = $el.data('editor'),
			frame   = wp.media.editor.get( editor ),
			options = {
				frame: 'post',
				state: 'shortcode-ui',
				title: shortcodeUIData.strings.media_frame_title,
				editor: this.dataset.editor
			};

		event.preventDefault();

		// Remove focus from the `.shortcake-add-post-element` button.
		// Prevents Opera from showing the outline of the button above the modal.
		// See: https://core.trac.wordpress.org/ticket/22445
		$el.trigger('blur');

		if ( frame ) {
			frame.mediaController.setActionSelect();
			frame.mediaController.props.set( 'editor', this.dataset.editor );
			frame.open();
		} else {
			frame = wp.media.editor.open( editor, options );
		}

		// Make sure to reset state when closed.
		frame.once( 'close submit', function() {
			frame.mediaController.reset();
		} );

	} );

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./collections/shortcodes.js":2,"./utils/shortcode-view-constructor.js":9,"./utils/sui.js":10,"./views/media-frame.js":20}],8:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

/**
 * A Utility object for batching requests for shortcode previews.
 *
 * Returns a "singleton" object with two methods, `queueToFetch` and
 * `fetchAll`. Calling `Fetcher.queueToFetch()` will add the requested query to
 * the fetcher's array, and set a timeout to run all queries after the current
 * call stack has finished.
 *
 * @this {Fetcher} aliased as `fetcher`
 */
var Fetcher = (function() {
	var fetcher = this;

	/*
	 * Counter, used to match each request in a batch with its response.
	 * @private
	 */
	this.counter = 0;

	/*
	 * Array of queries to be executed in a batch.
	 * @private
	 */
	this.queries = [];

	/*
	 * The timeout for the current batch request.
	 * @private
	 */
	this.timeout = null;

	/**
	 * Add a query to the queue.
	 *
	 * Adds the requested query to the next batch. Either sets a timeout to
	 * fetch previews, or adds to the current one if one is already being
	 * built. Returns a jQuery Deferred promise that will be resolved when the
	 * query is successful or otherwise complete.
	 *
	 * @param {object} query Object containing fields required to render preview: {
	 *   @var {integer} post_id Post ID
	 *   @var {string} shortcode Shortcode string to render
	 *   @var {string} nonce Preview nonce
	 * }
	 * @return {Deferred}
	 */
	this.queueToFetch = function( query ) {
		var fetchPromise = new $.Deferred();

		query.counter = ++fetcher.counter;

		fetcher.queries.push({
			promise: fetchPromise,
			query: query,
			counter: query.counter
		});

		if ( ! fetcher.timeout ) {
			fetcher.timeout = setTimeout( fetcher.fetchAll );
		}

		return fetchPromise;
	};

	/**
	 * Execute all queued queries.
	 *
	 * Posts to the `bulk_do_shortcode` ajax endpoint to retrieve any queued
	 * previews. When that request recieves a response, goes through the
	 * response and resolves each of the promises in it.
	 *
	 * @this {Fetcher}
	 */
	this.fetchAll = function() {
		delete fetcher.timeout;

		if ( 0 === fetcher.queries.length ) {
			return;
		}

		var request = wp.ajax.post( 'bulk_do_shortcode', {
			queries: _.pluck( fetcher.queries, 'query' ),
			nonce: shortcodeUIData.nonces.preview
		});

		request.done( function( responseData ) {
			_.each( responseData, function( result, index ) {
				var matchedQuery = _.findWhere( fetcher.queries, {
					counter: parseInt( index ),
				});

				if ( matchedQuery ) {
					fetcher.queries = _.without( fetcher.queries, matchedQuery );
					matchedQuery.promise.resolve( result );
				}
			} );
		} );
	};

	// Public API methods available
	return {
		queueToFetch : this.queueToFetch,
		fetchAll     : this.fetchAll
	};

})();

module.exports = Fetcher;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],9:[function(require,module,exports){
(function (global){
var sui = require('./sui.js'),
	fetcher = require('./fetcher.js'),
	wp = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null),
	$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

/**
 * Generic shortcode MCE view constructor.
 *
 * A Backbone-like View constructor intended for use when rendering a TinyMCE View.
 * The main difference is that the TinyMCE View is not tied to a particular DOM node.
 * This is cloned and used by each shortcode when registering a view.
 *
 */
var shortcodeViewConstructor = {

	/**
	 * Initialize a shortcode preview View.
	 *
	 * Fetches the preview by making a delayed Ajax call, and renders if a preview can be fetched.
	 *
	 * @constructor
	 * @this {Shortcode} Model registered with sui.shortcodes
	 * @param {Object} options Options
	 */
	initialize: function( options ) {
		var self = this;

		this.shortcodeModel = this.getShortcodeModel( this.shortcode );
		this.fetching = this.delayedFetch();

		this.fetching.done( function( queryResponse ) {
			var response = queryResponse.response;
			if ( '' === response ) {
				var span = $('<span />').addClass('shortcake-notice shortcake-empty').text( self.shortcodeModel.formatShortcode() );
				var wrapper = $('<div />').html( span );
				self.content = wrapper.html();
			} else {
				self.content = response;
			}
		}).fail( function() {
			var span = $('<span />').addClass('shortcake-error').text( shortcodeUIData.strings.mce_view_error );
			var wrapper = $('<div />').html( span );
			self.content = wrapper.html();
		} ).always( function() {
			delete self.fetching;
			self.render( null, true );
		} );
	},

	/**
	 * Get the shortcode model given the view shortcode options.
	 *
	 * If the shortcode found in the view is registered with Shortcake, this
	 * will clone the shortcode's Model and assign appropriate attribute
	 * values.
	 *
	 * @this {Shortcode}
	 * @param {Object} options Options formatted as wp.shortcode.
	 */
	getShortcodeModel: function( options ) {
		var shortcodeModel;

		shortcodeModel = sui.shortcodes.findWhere( { shortcode_tag: options.tag } );

		if ( ! shortcodeModel ) {
			return;
		}

		currentShortcode = shortcodeModel.clone();

		var attributes_backup = {};
		var attributes = options.attrs;
		for ( var key in attributes.named ) {

			if ( ! attributes.named.hasOwnProperty( key ) ) {
				continue;
			}

			value = attributes.named[ key ];
			attr  = currentShortcode.get( 'attrs' ).findWhere({ attr: key });

			// Reverse the effects of wpautop: https://core.trac.wordpress.org/ticket/34329
			value = this.unAutoP( value );

			if ( attr && attr.get('encode') ) {
				value = decodeURIComponent( value );
				value = value.replace( /&#37;/g, "%" );
			}

			if ( attr ) {
				attr.set( 'value', value );
			} else {
				attributes_backup[ key ] = value;
			}
		}

		currentShortcode.set( 'attributes_backup', attributes_backup );

		if ( options.content ) {
			var inner_content = currentShortcode.get( 'inner_content' );
			// Reverse the effects of wpautop: https://core.trac.wordpress.org/ticket/34329
			options.content = this.unAutoP( options.content );
			if ( inner_content ) {
				inner_content.set( 'value', options.content );
			} else {
				currentShortcode.set( 'inner_content_backup', options.content );
			}
		}

		return currentShortcode;
	},

	/**
	 * Queue a request with Fetcher class, and return a promise.
	 *
	 * @return {Promise}
	 */
	delayedFetch: function() {
		return fetcher.queueToFetch({
			post_id: $( '#post_ID' ).val(),
			shortcode: this.shortcodeModel.formatShortcode(),
			nonce: shortcodeUIData.nonces.preview,
		});
	},

	/**
	 * Fetch a preview of a single shortcode.
	 *
	 * Async. Sets this.content and calls this.render.
	 *
	 * @return undefined
	 */
	fetch: function() {
		var self = this;

		if ( ! this.fetching ) {
			this.fetching = true;

			wp.ajax.post( 'do_shortcode', {
				post_id: $( '#post_ID' ).val(),
				shortcode: this.shortcodeModel.formatShortcode(),
				nonce: shortcodeUIData.nonces.preview,
			}).done( function( response ) {
				if ( '' === response ) {
					self.content = '<span class="shortcake-notice shortcake-empty">' + self.shortcodeModel.formatShortcode() + '</span>';
				} else {
					self.content = response;
				}
			}).fail( function() {
				self.content = '<span class="shortcake-error">' + shortcodeUIData.strings.mce_view_error + '</span>';
			} ).always( function() {
				delete self.fetching;
				self.render( null, true );
			} );
		}
	},

	/**
	 * Get the shortcode model and open modal UI for editing.
	 *
	 * @param {string} shortcodeString String representation of the shortcode
	 */
	edit: function( shortcodeString, update ) {

		var currentShortcode = this.parseShortcodeString( shortcodeString );

		if ( currentShortcode ) {

			var frame = wp.media.editor.get( window.wpActiveEditor );

			if ( frame ) {
				frame.mediaController.setActionUpdate( currentShortcode );
				frame.mediaController.props.set( 'editor', wpActiveEditor );
				frame.open();
			} else {
				frame = wp.media.editor.open( window.wpActiveEditor, {
					frame : "post",
					state : 'shortcode-ui',
					currentShortcode : currentShortcode,
					editor : wpActiveEditor,
				});
			}

			frame.mediaController.props.set( 'insertCallback', function( shortcode ) {
				update( shortcode.formatShortcode() );
			} );

			// Make sure to reset state when closed.
			frame.once( 'close submit', function() {
				frame.mediaController.reset();
			} );
		}

	},

	/**
	 * Parse a shortcode string and return shortcode model.
	 * Must be a shortcode which has UI registered with Shortcake - see
	 * `window.sui.shortcodes`.
	 *
	 * @todo - I think there must be a cleaner way to get the
	 * shortcode & args here that doesn't use regex.
	 *
	 * @param  {string} shortcodeString
	 * @return Shortcode
	 */
	parseShortcodeString: function( shortcodeString ) {
		var model, attr;

		var shortcode_tags = _.map( sui.shortcodes.pluck( 'shortcode_tag' ), this.pregQuote ).join( '|' );
		var regexp = wp.shortcode.regexp( shortcode_tags );
		regexp.lastIndex = 0;
		var matches = regexp.exec( shortcodeString );

		if ( ! matches ) {
			return;
		}

		defaultShortcode = sui.shortcodes.findWhere({
			shortcode_tag : matches[2]
		});

		if ( ! defaultShortcode ) {
			return;
		}

		var shortcode = wp.shortcode.fromMatch( matches );
		return this.getShortcodeModel( shortcode );
	},

 	/**
	 * Strip 'p' and 'br' tags, replace with line breaks.
	 *
	 * Reverses the effect of the WP editor autop functionality.
	 *
	 * @param {string} content Content with `<p>` and `<br>` tags inserted
	 * @return {string}
	 */
	unAutoP: function( content ) {
		if ( switchEditors && switchEditors.pre_wpautop ) {
			content = switchEditors.pre_wpautop( content );
		}

		return content;
	},

	/**
	 * Escape any special characters in a string to be used as a regular expression.
	 *
	 * JS version of PHP's preg_quote()
	 *
	 * @see http://phpjs.org/functions/preg_quote/
	 *
	 * @param {string} str String to parse
	 * @param {string} delimiter Delimiter character to be also escaped - not used here
	 * @return {string}
	 */
	pregQuote: function( str, delimiter ) {
		return String(str)
			.replace(
				new RegExp( '[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + ( delimiter || '' ) + '-]', 'g' ),
				'\\$&' );
	},

};

module.exports = sui.utils.shortcodeViewConstructor = shortcodeViewConstructor;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./fetcher.js":8,"./sui.js":10}],10:[function(require,module,exports){
var Shortcodes = require('./../collections/shortcodes.js');

window.Shortcode_UI = window.Shortcode_UI || {
	shortcodes: new Shortcodes(),
	views: {},
	controllers: {},
	utils: {},
};

module.exports = window.Shortcode_UI;

},{"./../collections/shortcodes.js":2}],11:[function(require,module,exports){
(function (global){
var sui = require('./../utils/sui.js');
var $   = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

var editAttributeFieldAttachment = sui.views.editAttributeField.extend( {

	previewTemplate: wp.template( 'shortcake-image-preview' ),

	events: {
		'click .add'       : '_openMediaFrame',
		'click .remove'    : '_removeAttachment',
		'click .thumbnail' : '_openMediaFrame',
		'selectAttachment' : '_selectAttachment',
	},

	currentSelection: [],

	initialize: function() {

		var self = this;

		_.bindAll( self, 'updateValue', 'initSelection', '_renderPreview', '_renderAll', '_removeAttachment' );

		self.initSelection();

		self.currentSelection.on( 'all', this.updateValue );
		self.currentSelection.on( 'add', this._renderPreview );
		self.currentSelection.on( 'reset', this._renderAll );

	},

	/**
	 * Initialize Selection.
	 *
	 * Selection is an Attachment collection containing full models for the current value.
	 *
	 * @return null
	 */
	initSelection: function() {

		this.currentSelection = new wp.media.model.Selection( [], {
			multiple: this.model.get( 'multiple' ) ? true : false,
		} );

		// Initialize selection.
		_.each( this.getValue(), function( item ) {

			var model;

			// Legacy. Handle storing full objects.
			item  = ( 'object' === typeof( item ) ) ? item.id : item;
			model = new wp.media.attachment( item );

			this.currentSelection.add( model );

			// Re-render after attachments have synced.
			model.fetch();
			model.on( 'sync', this._renderAll );

		}.bind(this) );

	},

	/**
	 * Update the field attachment.
	 * Re-renders UI.
	 * If ID is empty - does nothing.
	 *
	 * @param {int} id Attachment ID
	 */
	updateValue: function() {
		var value = this.currentSelection.pluck( 'id' );
		this.setValue( value );
		this.triggerCallbacks();
	},

	render: function() {

		// Set model default values.
		for ( var arg in ShortcakeImageFieldData.defaultArgs ) {
			if ( ! this.model.get( arg ) ) {
				this.model.set( arg, ShortcakeImageFieldData.defaultArgs[ arg ] );
			}
		}

		this.$el.html( this.template( this.model.toJSON() ) );

		this.$container = this.$el.find( '.attachment-previews' );
		this.$thumbnailDetailsContainer   = this.$el.find( '.thumbnail-details-container' );
		var $addButton = this.$container.find( 'button.add' );

		this.frame = wp.media( {
			multiple: this.model.get( 'multiple' ) ? true : false,
			title:    this.model.get( 'frameTitle' ),
			library: {
				type: this.model.get( 'libraryType' ),
			},
		} );

		this.frame.on( 'select', function() {
			this.$el.trigger( 'selectAttachment' );
		}.bind( this ) );

		this._renderAll();

        this.triggerCallbacks();

	},

	_renderAll: function() {

		// Empty container.
		this.$container.html('');

		// Render each attachment in current selection.
		this.currentSelection.each( function( attachment ) {
			this._renderPreview( attachment );
		}.bind(this) );

	},

	/**
	 * Renders attachment preview in field.
	 * @param {object} attachment model
	 * @return null
	 */
	_renderPreview: function( attachment ) {

		var $thumbnail = $( this.previewTemplate( attachment.toJSON() ) );

		$thumbnail.appendTo( this.$container );

		attachment.on( 'remove', function() {
			$thumbnail.remove();
		} );

	},

	getValue: function() {

		var value = this.model.get( 'value' );

		if ( ! ( value instanceof Array ) ) {
			value = value.split( ',' );
		}

		value = value.map( function( id ) {
			return parseInt( id, 10 );
		} );

		value = value.filter( function( id ) {
			return id > 0;
		} );

		value.sort( function( a, b ) {
			return a < b;
		} );

		return value;

	},

	/**
	 * Open media frame when add button is clicked.
	 *
	 */
	_openMediaFrame: function(e) {

		e.preventDefault();
		this.frame.open();

		var selection = this.frame.state().get('selection');
		selection.reset( this.currentSelection.models );
		this.frame.state('library').set( 'selection', selection );

	},

	/**
	 * When an attachment is selected from the media frame, update the model value.
	 *
	 */
	_selectAttachment: function(e) {

		var selection  = this.frame.state().get('selection');
		this.currentSelection.reset( selection.toJSON() );

		this.frame.close();

	},

	/**
	 * Remove the attachment.
	 * Render preview & Update the model.
	 */
	_removeAttachment: function(e) {

		e.preventDefault();

		var id = $( e.target ).attr( 'data-id' );

		if ( ! id ) {
			return;
		}

		var target = this.currentSelection.get( id );

		if ( target ) {
			this.currentSelection.remove( target );
		}

	},

});

module.exports = sui.views.editAttributeFieldAttachment = editAttributeFieldAttachment;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../utils/sui.js":10}],12:[function(require,module,exports){
(function (global){
var sui = require('./../utils/sui.js'),
    editAttributeField = require('./edit-attribute-field.js'),
    $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

sui.views.editAttributeFieldColor = editAttributeField.extend({

	// All events are being listened by iris, and they don't bubble very well,
	// so remove Backbone's listeners.
	events: {},

	render: function() {
		var self = this;

		var data = jQuery.extend( {
			id: 'shortcode-ui-' + this.model.get( 'attr' ) + '-' + this.model.cid,
		}, this.model.toJSON() );

		// Convert meta JSON to attribute string.
		var _meta = [];
		for ( var key in data.meta ) {

			// Boolean attributes can only require attribute key, not value.
			if ( 'boolean' === typeof( data.meta[ key ] ) ) {

				// Only set truthy boolean attributes.
				if ( data.meta[ key ] ) {
					_meta.push( _.escape( key ) );
				}

			} else {

				_meta.push( _.escape( key ) + '="' + _.escape( data.meta[ key ] ) + '"' );

			}

		}

		data.meta = _meta.join( ' ' );

		this.$el.html( this.template( data ) );
		this.triggerCallbacks();

		this.$el.find('input[type="text"]:not(.wp-color-picker)').wpColorPicker({
			change: function(e, ui) {
				self.setValue( $(this).wpColorPicker('color') );
				self.triggerCallbacks();
			}
		});

		return this;
	}

});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../utils/sui.js":10,"./edit-attribute-field.js":16}],13:[function(require,module,exports){
(function (global){
var Backbone     = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null),
	sui          = require('./../utils/sui.js'),
	select2Field = require('./select2-field.js'),
	$            = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

sui.views.editAttributeFieldPostSelect = sui.views.editAttributeSelect2Field.extend( {

	selector: '.shortcode-ui-post-select',

	ajaxData: {
		action    : 'shortcode_ui_post_field',
		nonce     : shortcodeUiPostFieldData.nonce,
	},

	events: {
		'change .shortcode-ui-post-select': 'inputChanged',
	},

	templateResult: function( post ) {
		if ( post.loading ) {
			return post.text;
		}

		var markup = '<div class="clearfix select2-result-selectable">' +
			post.text +
		'</div>';

		return markup;
	},

	templateSelection: function( post, container ) {
		return post.text;
	},


} );

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../utils/sui.js":10,"./select2-field.js":23}],14:[function(require,module,exports){
(function (global){
var Backbone     = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null),
	sui          = require('./../utils/sui.js'),
	select2Field = require('./select2-field.js'),
	$            = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

sui.views.editAttributeFieldTermSelect = sui.views.editAttributeSelect2Field.extend( {

	selector: '.shortcode-ui-term-select',

	ajaxData: {
		action    : 'shortcode_ui_term_field',
		nonce     : shortcodeUiTermFieldData.nonce,
	},

	events: {
		'change .shortcode-ui-term-select': 'inputChanged',
	},

	templateResult: function( post ) {
		if ( post.loading ) {
			return post.text;
		}

		var markup = '<div class="clearfix select2-result-selectable">' +
			post.text +
		'</div>';

		return markup;
	},

	templateSelection: function( post, container ) {
		return post.text;
	},

} );

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../utils/sui.js":10,"./select2-field.js":23}],15:[function(require,module,exports){
(function (global){
var Backbone     = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null),
	sui          = require('./../utils/sui.js'),
	select2Field = require('./select2-field.js'),
	$            = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

sui.views.editAttributeFieldUserSelect = sui.views.editAttributeSelect2Field.extend( {

	selector: '.shortcode-ui-user-select',

	ajaxData: {
		action    : 'shortcode_ui_user_field',
		nonce     : shortcodeUiUserFieldData.nonce,
	},

	events: {
		'change .shortcode-ui-user-select': 'inputChanged',
	},

	templateResult: function( user ) {
		if ( user.loading ) {
			return user.text;
		}

		var markup = '<div class="clearfix select2-result-selectable">' +
			user.text +
		'</div>';

		return markup;
	},

	templateSelection: function( user, container ) {
		return user.text;
	},


} );

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../utils/sui.js":10,"./select2-field.js":23}],16:[function(require,module,exports){
(function (global){
var Backbone     = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null),
	sui          = require('./../utils/sui.js'),
	$            = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

var editAttributeField = Backbone.View.extend( {

	tagName: "div",

	events: {
		'input  input':                  'inputChanged',
		'input  textarea':               'inputChanged',
		'change select':                 'inputChanged',
		'change input[type="radio"]':    'inputChanged',
		'change input[type="checkbox"]': 'inputChanged'
	},

	render: function() {

		var data = jQuery.extend( {
			id: 'shortcode-ui-' + this.model.get( 'attr' ) + '-' + this.model.cid,
		}, this.model.toJSON() );

		// Convert meta JSON to attribute string.
		var _meta = [];
		for ( var key in data.meta ) {

			// Boolean attributes can only require attribute key, not value.
			if ( 'boolean' === typeof( data.meta[ key ] ) ) {

				// Only set truthy boolean attributes.
				if ( data.meta[ key ] ) {
					_meta.push( _.escape( key ) );
				}

			} else {

				_meta.push( _.escape( key ) + '="' + _.escape( data.meta[ key ] ) + '"' );

			}

		}

		data.meta = _meta.join( ' ' );

		// Ensure options are formatted correctly.
		if ( 'options' in data ) {
			data.options = this.parseOptions( data.options );
		}

		// Ensure default value for select field.
		if ( 'select' === data.type && '' === this.model.get( 'value' ) && ! _.findWhere( data.options, { value: '' } ) ) {
			var firstVisibleOption = _.first( data.options );
			if ( firstVisibleOption && 'undefined' !== typeof firstVisibleOption.value ) {
				this.setValue( firstVisibleOption.value );
				data.value = firstVisibleOption.value;
			}
		}

		this.$el.html( this.template( data ) );
		this.triggerCallbacks();

		return this;
	},

	/**
	 * Input Changed Update Callback.
	 *
	 * If the input field that has changed is for content or a valid attribute,
	 * then it should update the model. If a callback function is registered
	 * for this attribute, it should be called as well.
	 */
	inputChanged: function( e ) {

		var $el;

		if ( this.model.get( 'attr' ) ) {
			$el = this.$el.find( '[name="' + this.model.get( 'attr' ) + '"]' );
		} else {
			$el = this.$el.find( '[name="inner_content"]' );
		}

		if ( 'radio' === this.model.attributes.type ) {
			this.setValue( $el.filter(':checked').first().val() );
		} else if ( 'checkbox' === this.model.attributes.type ) {
			this.setValue( $el.is( ':checked' ) );
		}  else if ( 'range' === this.model.attributes.type ) {
			var rangeId =  '#' + e.target.id + '_indicator';
			var rangeValue = e.target.value;
			document.querySelector( rangeId ).value = rangeValue;
			this.setValue( $el.val() );
		} else {
			this.setValue( $el.val() );
		}

		this.triggerCallbacks();
	},

	getValue: function() {
		return this.model.get( 'value' );
	},

	setValue: function( val ) {
		this.model.set( 'value', val );
	},

	triggerCallbacks: function() {

		var shortcodeName = this.shortcode.attributes.shortcode_tag,
			attributeName = this.model.get( 'attr' ),
			hookName      = [ shortcodeName, attributeName ].join( '.' ),
			changed       = this.model.changed,
			collection    = _.flatten( _.values( this.views.parent.views._views ) ),
			shortcode     = this.shortcode;

		/*
		 * Action run when an attribute value changes on a shortcode
		 *
		 * Called as `{shortcodeName}.{attributeName}`.
		 *
		 * @param changed (object)
		 *           The update, ie. { "changed": "newValue" }
		 * @param viewModels (array)
		 *           The collections of views (editAttributeFields)
		 *                         which make up this shortcode UI form
		 * @param shortcode (object)
		 *           Reference to the shortcode model which this attribute belongs to.
		 */
		wp.shortcake.hooks.doAction( hookName, changed, collection, shortcode );

	},

	/**
	 * Parse Options to ensure they use the correct format.
	 *
	 * Backwards compatability for non-array options.
	 * Using objects was sub-optimal because properties don't have an order.
	 */
	parseOptions: function( options ) {

		if ( ! Array.isArray( options ) ) {
			var _options = [];
			_.each( Object.keys( options ), function( key ) {
				_options.push( { value: key, label: options[ key ] } );
			} );
			options = _options;
		} else {
			options = options.map( function( option ) {
				if ( 'object' !== typeof option ) {
					option = { value: option, label: option };
				}
				return option;
			} );
		}

		return options;

	}

}, {

	/**
	 * Get an attribute field from a shortcode by name.
	 *
	 * Usage: `sui.views.editAttributeField.getField( collection, 'title')`
	 *
	 * @param array collection of editAttributeFields
	 * @param string attribute name
	 * @return editAttributeField The view corresponding to the matching field
	 */
	getField: function( collection, attr ) {
		return _.find( collection,
			function( viewModel ) {
				return attr === viewModel.model.get('attr');
			}
		);
	}
});

sui.views.editAttributeField = editAttributeField;
module.exports = editAttributeField;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../utils/sui.js":10}],17:[function(require,module,exports){
(function (global){
var wp = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null),
sui = require('./../utils/sui.js'),
backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null),
	editAttributeField = require('./edit-attribute-field.js'),

	// Additional attribute field types: these fields are all standalone in functionality,
	// but bundled here for simplicity to save an HTTP request.
	editAttributeFieldAttachment = require('./edit-attribute-field-attachment.js'),
	editAttributeFieldPostSelect = require('./edit-attribute-field-post-select.js'),
	editAttributeFieldTermSelect = require('./edit-attribute-field-term-select.js'),
	editAttributeFieldUserSelect = require('./edit-attribute-field-user-select.js'),
	editAttributeFieldColor      = require('./edit-attribute-field-color.js');


/**
 * Single edit shortcode content view.
 */
var EditShortcodeForm = wp.Backbone.View.extend({
	template: wp.template('shortcode-default-edit-form'),

	initialize: function() {

		var t = this;

		var innerContent = this.model.get( 'inner_content' );
		if ( innerContent && typeof innerContent.attributes.type !== 'undefined' ) {

			// add UI for inner_content
			var view = new editAttributeField( { model: innerContent } );

			view.shortcode = t.model;
			view.template = wp.media.template( 'shortcode-ui-content' );

			t.views.add( '.edit-shortcode-form-fields', view );

		}

		this.model.get( 'attrs' ).each( function( attr ) {

			// Get the field settings from localization data.
			var type = attr.get('type');

			if ( ! shortcodeUIFieldData[ type ] ) {
				return;
			}

			var templateData = {
				value: attr.get('value'),
				attr_raw: {
					name: attr.get('value')
				}
			};

			var viewObjName = shortcodeUIFieldData[ type ].view;
			var tmplName    = shortcodeUIFieldData[ type ].template;

			var view       = new sui.views[viewObjName]( { model: attr } );
			view.template  = wp.media.template( tmplName );
			view.shortcode = t.model;

			t.views.add( '.edit-shortcode-form-fields', view );

		} );

		if ( 0 === this.model.get( 'attrs' ).length && ( ! innerContent || typeof innerContent == 'undefined' ) ) {
			var messageView = new Backbone.View({
				tagName:      'div',
				className:    'notice updated',
			});
			messageView.render = function() {
				this.$el.append( '<p>' );
				this.$el.find('p').text( shortcodeUIData.strings.media_frame_no_attributes_message );
				return this;
			};
			t.views.add( '.edit-shortcode-form-fields', messageView );
		}

	},

});

module.exports = sui.views.EditShortcodeForm = EditShortcodeForm;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../utils/sui.js":10,"./edit-attribute-field-attachment.js":11,"./edit-attribute-field-color.js":12,"./edit-attribute-field-post-select.js":13,"./edit-attribute-field-term-select.js":14,"./edit-attribute-field-user-select.js":15,"./edit-attribute-field.js":16}],18:[function(require,module,exports){
(function (global){
var wp = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null),
	$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

/**
 * Single shortcode list item view.
 */
var insertShortcodeListItem = wp.Backbone.View.extend({

	tagName : 'li',
	template : wp.template('add-shortcode-list-item'),
	className : 'shortcode-list-item',

	render : function() {

		var data = this.model.toJSON();
		this.$el.attr('data-shortcode', data.shortcode_tag);

		if (('listItemImage' in data) && 0 === data.listItemImage.indexOf('dashicons-')) {
			var fakeEl = $('<div />').addClass( 'dashicons' ).addClass( data.listItemImage );
			data.listItemImage = $('<div />').append( fakeEl ).html();
		}

		this.$el.html(this.template(data));

		return this;

	}
});

module.exports = insertShortcodeListItem;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],19:[function(require,module,exports){
(function (global){
var wp = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null);
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
var Shortcodes = require('./../collections/shortcodes.js');
var insertShortcodeListItem = require('./insert-shortcode-list-item.js');

var insertShortcodeList = wp.Backbone.View.extend({

	tagName : 'div',
	template : wp.template('add-shortcode-list'),

	initialize : function( options ) {

		this.displayShortcodes( options );

	},
	
	refresh: function( shortcodeData ) {
		var options;
		if ( shortcodeData instanceof Backbone.Collection ) {
			options = { shortcodes: shortcodeData };
		} else {
			options = { shortcodes: new Shortcodes( shortcodeData ) };
		}
		this.displayShortcodes( options );
	},
	
	displayShortcodes: function(options) {
		var t = this;
		
		t.$el.find('.add-shortcode-list').html('');
		t.options = {};
		t.options.shortcodes = options.shortcodes;

		t.options.shortcodes.each(function(shortcode) {
			t.views.add('ul', new insertShortcodeListItem({
				model : shortcode
			}));
		});
	}

});

module.exports = insertShortcodeList;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../collections/shortcodes.js":2,"./insert-shortcode-list-item.js":18}],20:[function(require,module,exports){
(function (global){
var wp = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null),
	$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null),
	MediaController = require('./../controllers/media-controller.js'),
	Shortcode_UI = require('./shortcode-ui'),
	Toolbar = require('./media-toolbar');

var postMediaFrame = wp.media.view.MediaFrame.Post;
var mediaFrame = postMediaFrame.extend( {

	events: _.extend( {}, postMediaFrame.prototype.events, {
			'click .media-menu-item' : 'resetMediaController',
		}
	),

	initialize: function() {

		postMediaFrame.prototype.initialize.apply( this, arguments );

		var id = 'shortcode-ui';

		this.mediaController = new MediaController({
			id       : id,
			search   : true,
			router   : false,
			toolbar  : id + '-toolbar',
			menu     : 'default',
			title    : shortcodeUIData.strings.media_frame_menu_insert_label,
			tabs     : [ 'insert' ],
			priority :  66,
			content  : id + '-content-insert',
		});

		if ( 'currentShortcode' in this.options ) {
			this.mediaController.setActionUpdate( this.options.currentShortcode );
		}

		this.states.add([ this.mediaController ]);

		this.on( 'content:render:' + id + '-content-insert', _.bind( this.contentRender, this, 'shortcode-ui', 'insert' ) );
		this.on( 'toolbar:create:' + id + '-toolbar', this.toolbarCreate, this );
		this.on( 'menu:render:default', this.renderShortcodeUIMenu );

	},

	resetMediaController: function( event ) {
		if ( this.state() && 'undefined' !== typeof this.state().props && this.state().props.get('currentShortcode') ) {
			this.mediaController.reset();
			this.contentRender( 'shortcode-ui', 'insert' );
		}
	},

	contentRender : function( id, tab ) {
		this.setState( 'shortcode-ui' );
		this.content.set(
			new Shortcode_UI( {
				controller: this,
				className:  'clearfix ' + id + '-content ' + id + '-content-' + tab
			} )
		);
	},

	toolbarCreate : function( toolbar ) {

		var text = shortcodeUIData.strings.media_frame_toolbar_insert_label;

		if ( this.state().props.get('currentShortcode') ) {
			text = shortcodeUIData.strings.media_frame_toolbar_update_label;
		}

		toolbar.view = new Toolbar( {
			controller : this,
			items: {
				insert: {
					text: text,
					style: 'primary',
					priority: 80,
					requires: false,
					click: this.insertAction,
				}
			}
		} );
	},

	renderShortcodeUIMenu: function( view ) {

		// Add a menu separator link.
		view.set({
			'shortcode-ui-separator': new wp.media.View({
				className: 'separator',
				priority: 65
			})
		});
	},

	insertAction: function() {
		/* Trigger render_destroy */
		/*
		 * Action run before the shortcode overlay is destroyed.
		 *
		 * Called as `shortcode-ui.render_destroy`.
		 *
		 * @param shortcodeModel (object)
		 *           Reference to the shortcode model used in this overlay.
		 */
		var hookName = 'shortcode-ui.render_destroy';
		var shortcodeModel = this.controller.state().props.get( 'currentShortcode' );
		wp.shortcake.hooks.doAction( hookName, shortcodeModel );

		this.controller.state().insert();

	},

} );

module.exports = mediaFrame;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../controllers/media-controller.js":3,"./media-toolbar":21,"./shortcode-ui":24}],21:[function(require,module,exports){
(function (global){
var wp = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null);

/**
 * Toolbar view that extends wp.media.view.Toolbar
 * to define cusotm refresh method
 */
var Toolbar = wp.media.view.Toolbar.extend({
	initialize : function() {
		_.defaults(this.options, {
			requires : false
		});
		// Call 'initialize' directly on the parent class.
		wp.media.view.Toolbar.prototype.initialize.apply(this, arguments);
	},

	refresh : function() {
		var action = this.controller.state().props.get('action');
		if( this.get('insert') ) {
			this.get('insert').model.set('disabled', action == 'select');
		}
		/**
		 * call 'refresh' directly on the parent class
		 */
		wp.media.view.Toolbar.prototype.refresh.apply(this, arguments);
	}
});

module.exports = Toolbar;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],22:[function(require,module,exports){
(function (global){
var wp = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null);
sui = require('./../utils/sui.js');

var SearchShortcode = wp.media.view.Search.extend({
	tagName:   'input',
	className: 'search',
	id:        'media-search-input',
	
	initialize: function( options ) {
		this.shortcodeList = options.shortcodeList;
	}, 

	attributes: {
		type:        'search',
		placeholder: shortcodeUIData.strings.search_placeholder
	},

	events: {
		'keyup':  'search',
	},

	/**
	 * @returns {wp.media.view.Search} Returns itself to allow chaining
	 */
	render: function() {
		this.el.value = this.model.escape('search');
		return this;
	},
	
	refreshShortcodes: function( shortcodeData ) {
		this.shortcodeList.refresh( shortcodeData );
	},

	search: function( event ) {
		if ( '' === event.target.value ) {
			this.refreshShortcodes( sui.shortcodes );
		} else {
			this.refreshShortcodes( this.controller.search( event.target.value ) );
		}
	}
});

sui.views.SearchShortcode = SearchShortcode;
module.exports = SearchShortcode;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../utils/sui.js":10}],23:[function(require,module,exports){
(function (global){
var Backbone     = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null),
	sui          = require('./../utils/sui.js'),
	$            = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

/**
 * Abstract field for all ajax Select2-powered field views
 *
 * Adds useful helpers that are shared between all of the fields which use
 * Select2 as their UI.
 *
 */
sui.views.editAttributeSelect2Field = sui.views.editAttributeField.extend( {

	/**
	 * Store selection on model as a string. If this is a multiple selection,
	 * we'll be storing the value as a comma-separated list.
	 *
	 * @param jQuery.Event Change event triggered.
	 */
	inputChanged: function(e) {
		var _selected = $( e.currentTarget ).val();

		// Empty fields will have null values. We don't want to coerce that to the string "null".
		if ( _selected === null ) {
			_selected = '';
		}

		// Store multiple selections as comma-delimited list
		if ( Array.isArray( _selected ) ) {
			_selected = _selected.join( ',' );
		}

		this.setValue( String( _selected ) );
		this.triggerCallbacks();
	},

	/**
	 * Load the values to be preselected before initializing field
	 *
	 * @param $field jQuery object reference to the <select> field
	 * @param object ajaxData object containing ajax action, nonce, and shortcode & model data
	 * @param string includeField how to specify the current selection, ie 'post__in'
	 */
	preselect: function( $field ) {
		var _preselected = String( this.getValue() );

		if ( _preselected.length ) {
			var request = {
				include   : _preselected,
				shortcode : this.shortcode.get( 'shortcode_tag'),
				attr      : this.model.get( 'attr' )
			};

			$.get( ajaxurl, $.extend( request, this.ajaxData ),
				function( response ) {
					_.each( response.data.items, function( item ) {
						$('<option>')
							.attr( 'value', item.id )
							.text( item.text )
							.prop( 'selected', 'selected' )
							.appendTo( $field );
					} );
				}
			);
		}
	},

	/**
	 * Make selections in this field sortable, if it's multiple select
	 *
	 * @param $field jQuery object reference to the <select> field
	 */
	sortable: function( $field ) {
		var ul = $field.next('.select2-container').first('ul.select2-selection__rendered');
		ul.sortable({
			placeholder : 'ui-state-highlight',
			forcePlaceholderSize: true,
			items       : 'li:not(.select2-search__field)',
			tolerance   : 'pointer',
			stop: function() {
				$( $(ul).find('.select2-selection__choice').get().reverse() ).each(function() {
					var id = $(this).data('data').id;
					var option = $field.find('option[value="' + id + '"]')[0];
					$field.prepend(option);
				});
				$field.trigger( 'change' );
			}
		});
	},

	render: function() {

		var self = this,
			defaults = { 
				multiple: false,
				allowClear: false
			};

		for ( var arg in defaults ) {
			if ( ! this.model.get( arg ) ) {
				this.model.set( arg, defaults[ arg ] );
			}
		}

		var data = this.model.toJSON();
		data.id = 'shortcode-ui-' + this.model.get( 'attr' ) + '-' + this.model.cid;

		this.$el.html( this.template( data ) );

		var $field = this.$el.find( this.selector );

		this.preselect( $field );

		var $fieldSelect2 = $field[ shortcodeUIData.select2_handle ]({
			placeholder: "Search",
			multiple: this.model.get( 'multiple' ),
			allowClear: this.model.get( 'allowClear' ),
			dropdownParent: this.$el,

			ajax: {
				url: ajaxurl,
				dataType: 'json',
				delay: 250,
				data: function (params) {
					return $.extend( {
						s         : params.term, // search term
						page      : params.page,
						shortcode : self.shortcode.get( 'shortcode_tag'),
						attr      : self.model.get( 'attr' )
					}, self.ajaxData );
				},
				processResults: function (response, params) {
					if ( ! response.success || 'undefined' === typeof response.data ) {
						return { results: [] };
					}
					var data = response.data;
					params.page = params.page || 1;
					return {
						results: data.items,
						pagination: {
							more: ( params.page * data.items_per_page ) < data.found_items
						}
					};
				},
				cache: true
			},

			escapeMarkup: function( markup ) { return markup; },
			minimumInputLength: 1,
			templateResult: this.templateResult,
			templateSelection: this.templateSelection,
		} );

		if ( this.model.get( 'multiple' ) ) {
			this.sortable( $field );
		}

		return this;
	}
});

/**
 * Extending SUI Media Controller to hide Select2 UI Drop-Down when menu
 * changes in Meida modal
 * 1. going back/forth between different shortcakes (refresh)
 * 2. changing the menu in left column (deactivate)
 * 3. @TODO closing the modal.
 */
var mediaController = sui.controllers.MediaController;
sui.controllers.MediaController = mediaController.extend({

	refresh: function(){
		mediaController.prototype.refresh.apply( this, arguments );
		this.destroySelect2UI();
	},

	//doesn't need to call parent as it already an "abstract" method in parent to provide callback
	deactivate: function() {
		this.destroySelect2UI();
	},

	destroySelect2UI: function() {
		$fieldSelect2[ shortcodeUIData.select2_handle ]( 'close' );
	}

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../utils/sui.js":10}],24:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null),
	insertShortcodeList = require('./insert-shortcode-list.js'),
	EditShortcodeForm = require('./edit-shortcode-form.js'),
	Toolbar = require('./media-toolbar.js'),
	SearchShortcode = require('./search-shortcode.js'),
	sui = require('./../utils/sui.js'),
	$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

var Shortcode_UI = Backbone.View.extend({

	events: {
		"click .add-shortcode-list li":      "select",
		"click .edit-shortcode-form-cancel": "cancelSelect"
	},

	initialize: function(options) {
		this.controller = options.controller.state();
		//toolbar model looks for controller.state()
		this.toolbar_controller = options.controller;
	},

	createToolbar: function(options) {
		toolbarOptions = {
			controller: this.toolbar_controller
		};

		this.toolbar = new Toolbar( toolbarOptions );

		this.views.add( this.toolbar );

		this.toolbar.set( 'search', new SearchShortcode({
			controller:    this.controller,
			model:         this.controller.props,
			shortcodeList: this.shortcodeList,
			priority:   60
		}).render() );

	},

	render: function() {

		this.$el.html('');

		switch( this.controller.props.get('action') ) {
			case 'select' :
				this.renderSelectShortcodeView();
				break;
			case 'update' :
			case 'insert' :
				this.renderEditShortcodeView();
				break;
		}

	},

	renderSelectShortcodeView: function() {
		this.views.unset();
		this.shortcodeList = new insertShortcodeList( { shortcodes: sui.shortcodes } );
		this.createToolbar();
		this.views.add('', this.shortcodeList);
	},

	renderEditShortcodeView: function() {
		var shortcode = this.controller.props.get( 'currentShortcode' );
		var view = new EditShortcodeForm({ model: shortcode });
		this.$el.append( view.render().el );

		if ( this.controller.props.get('action') === 'update' ) {
			this.$el.find( '.edit-shortcode-form-cancel' ).remove();
		}

		return this;

	},

	cancelSelect: function( e ) {
		e.preventDefault();

		this.controller.props.set( 'action', 'select' );
		this.controller.props.set( 'currentShortcode', null );
		this.render();
	},

	select: function(e) {

		var target    = $(e.currentTarget).closest( '.shortcode-list-item' );
		var shortcode = sui.shortcodes.findWhere( { shortcode_tag: target.attr( 'data-shortcode' ) } );

		if ( ! shortcode ) {
			return;
		}

		this.controller.props.set( 'action', 'insert' );
		this.controller.props.set( 'currentShortcode', shortcode.clone() );

		this.render();

		/* Trigger render_new */
		/*
		 * Action run after a new shortcode overlay is rendered.
		 *
		 * Called as `shortcode-ui.render_new`.
		 *
		 * @param shortcodeModel (object)
		 *           Reference to the shortcode model used in this overlay.
		 */
		var hookName = 'shortcode-ui.render_new';
		var shortcodeModel = this.controller.props.get( 'currentShortcode' );
		wp.shortcake.hooks.doAction( hookName, shortcodeModel );

	},

});

module.exports = Shortcode_UI;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../utils/sui.js":10,"./edit-shortcode-form.js":17,"./insert-shortcode-list.js":19,"./media-toolbar.js":21,"./search-shortcode.js":22}]},{},[7]);
