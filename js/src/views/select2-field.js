var Backbone     = require('backbone'),
	sui          = require('sui-utils/sui'),
	$            = require('jquery');

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
						attr      : self.model.get( 'attr' ),
						fields    : self.$el.parents('form').serialize()
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
