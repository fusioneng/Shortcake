(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var InnerContent = require('../../js/src/models/inner-content');

describe( "Shortcode Inner Content Model", function() {

	var data = {
		label:       'Inner Content',
		type:        'textarea',
		value:       'test content',
		placeholder: 'test placeholder',
	};

	it( 'sets defaults correctly.', function() {
		var content = new InnerContent();
		expect( content.toJSON() ).toEqual( {
			label:       'Inner Content',
			type:        'textarea',
			value:       '',
			placeholder: '',
		} );
	});

	it( 'sets data correctly.', function() {
		var content = new InnerContent( data );
		expect( content.toJSON() ).toEqual( data );
	});

} );

},{"../../js/src/models/inner-content":10}],2:[function(require,module,exports){
var ShortcodeAttribute = require('../../js/src/models/shortcode-attribute');

describe( "Shortcode Attribute Model", function() {

	var attrData = {
		attr:        'attr',
		label:       'Attribute',
		type:        'text',
		value:       'test value',
		description: 'test description',
		encode:      false,
		meta:  {
			placeholder: 'test placeholder'
		},
	};

	var attr = new ShortcodeAttribute( attrData );

	it( 'should correctly set data.', function() {
		expect( attr.toJSON() ).toEqual( attrData );
	});


} );

},{"../../js/src/models/shortcode-attribute":11}],3:[function(require,module,exports){
(function (global){
var Shortcode = require('../../js/src/models/shortcode');
var InnerContent = require('../../js/src/models/inner-content');
var ShortcodeAttribute = require('../../js/src/models/shortcode-attribute');
var ShortcodeAttributes = require('../../js/src/collections/shortcode-attributes');
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

describe( "Shortcode Model", function() {

	var defaultShortcode, shortcode, data;

	data = {
		label: 'Test Label',
		shortcode_tag: 'test_shortcode',
		attrs: [
			{
				attr:        'attr',
				label:       'Attribute',
				type:        'text',
				value:       'test value',
				placeholder: 'test placeholder'
			}
		],
		inner_content: {
			value: 'test content',
		},
	};

	defaultShortcode = new Shortcode();
	shortcode = new Shortcode( data );

	it( 'Defaults set correctly.', function() {
		expect( defaultShortcode.get( 'label' ) ).toEqual( '' );
		expect( defaultShortcode.get( 'shortcode_tag' ) ).toEqual( '' );
		expect( defaultShortcode.get( 'attrs' ) instanceof ShortcodeAttributes ).toEqual( true );
		expect( defaultShortcode.get( 'attrs' ).length ).toEqual( 0 );
		expect( defaultShortcode.get( 'inner_content' ) ).toEqual( undefined );
	});

	it( 'Attribute data set correctly..', function() {
		expect( shortcode.get( 'attrs' ) instanceof ShortcodeAttributes ).toEqual( true );
		expect( shortcode.get( 'attrs' ).length ).toEqual( 1 );
		expect( shortcode.get( 'attrs' ).first().get('type') ).toEqual( data.attrs[0].type );
	});

	it( 'Inner content set correctly..', function() {
		expect( shortcode.get( 'inner_content' ) instanceof InnerContent ).toEqual( true );
		expect( shortcode.get( 'inner_content' ).get('value') ).toEqual( data.inner_content.value );
	});

	it( 'Converted to JSON correctly.', function() {
		var json = shortcode.toJSON();
		expect( json.label ).toEqual( data.label );
		expect( json.attrs[0].label ).toEqual( data.attrs[0].label );
	});

	it( 'Format shortcode.', function() {

		var _shortcode = jQuery.extend( true, {}, shortcode );

		// Test with attribute and with content.
		expect( _shortcode.formatShortcode() ).toEqual( '[test_shortcode attr="test value"]test content[/test_shortcode]' );

		// Test without content.
		_shortcode.get('inner_content').unset( 'value' );
		expect( _shortcode.formatShortcode() ).toEqual( '[test_shortcode attr="test value" /]' );

		// Test without attributes
		_shortcode.get( 'attrs' ).first().unset( 'value' );
		expect( _shortcode.formatShortcode() ).toEqual( '[test_shortcode /]' );

	});

	it( 'Format shortcode with encoded attributes.', function() {

		var shortcode_encoded_attribute, formatted, expected;

		shortcode_encoded_attribute = new Shortcode({
			label: 'Test Label',
			shortcode_tag: 'test_shortcode_encoded',
			attrs: [
				{
					attr:   'attr',
					type:   'text',
					value:  '<b class="foo">bar</b>',
					encode: true,
				},
			],
		});

		formatted = shortcode_encoded_attribute.formatShortcode();
		expected  = '[test_shortcode_encoded attr="%3Cb%20class%3D%22foo%22%3Ebar%3C%2Fb%3E" /]';
		expect( formatted ).toEqual( expected );

	});

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../js/src/collections/shortcode-attributes":8,"../../js/src/models/inner-content":10,"../../js/src/models/shortcode":12,"../../js/src/models/shortcode-attribute":11}],4:[function(require,module,exports){
(function (global){
var Shortcode = require('../../js/src/models/shortcode');
var ShortcodeViewConstructor = require('../../js/src/utils/shortcode-view-constructor');
var EditAttributeField = require('../../js/src/views/edit-attribute-field');
var sui = require('../../js/src/utils/sui');
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

describe( 'Shortcode View Constructor', function(){

	it( 'Persists inner_content when parsing a shortcode without inner_content attribute defined', function(){
		var data = {
			label: 'Test Label',
			shortcode_tag: 'no_inner_content',
			attrs: [
				{
					attr:        'foo',
					label:       'Attribute',
					type:        'text',
					value:       'test value',
					placeholder: 'test placeholder',
				}
			]
		};
		sui.shortcodes.add( data );
		var shortcode = ShortcodeViewConstructor.parseShortcodeString( '[no_inner_content foo="bar"]burrito[/no_inner_content]' );
		var _shortcode = $.extend( true, {}, shortcode );
		expect( _shortcode.formatShortcode() ).toEqual( '[no_inner_content foo="bar"]burrito[/no_inner_content]' );
		ShortcodeViewConstructor.shortcode = {
			'type' : 'single',
			'tag' : 'no_inner_content',
			'attrs' : {
				'named' : {
					'foo' : 'bar',
				},
				'numeric' : [],
			},
			'content' : 'burrito'
		};
		var ShortcodeViewConstructorWithoutFetch = ShortcodeViewConstructor;
		ShortcodeViewConstructorWithoutFetch.delayedFetch = function() {
			return new $.Deferred();
		};
		ShortcodeViewConstructor.initialize();
		expect( ShortcodeViewConstructor.shortcodeModel.formatShortcode() ).toEqual( '[no_inner_content foo="bar"]burrito[/no_inner_content]' );
	});

	it( 'Persists custom attribute when parsing a shortcode without the attribute defined in UI', function() {
		var data = {
			label: 'Test Label',
			shortcode_tag: 'no_custom_attribute',
			attrs: [
				{
					attr:        'foo',
					label:       'Attribute',
					type:        'text',
				}
			]
		};
		sui.shortcodes.add( data );
		var shortcode = ShortcodeViewConstructor.parseShortcodeString( '[no_custom_attribute foo="bar" bar="banana"]' );
		var _shortcode = $.extend( true, {}, shortcode );
		expect( _shortcode.formatShortcode() ).toEqual( '[no_custom_attribute foo="bar" bar="banana" /]' );
		ShortcodeViewConstructor.shortcode = {
			'type' : 'single',
			'tag' : 'no_custom_attribute',
			'attrs' : {
				'named' : {
					'foo' : 'bar',
					'bar' : 'banana',
				},
				'numeric' : [],
			},
		};
		var ShortcodeViewConstructorWithoutFetch = ShortcodeViewConstructor;
		ShortcodeViewConstructorWithoutFetch.delayedFetch = function() {
			return new $.Deferred();
		};
		ShortcodeViewConstructor.initialize();
		expect( ShortcodeViewConstructor.shortcodeModel.formatShortcode() ).toEqual( '[no_custom_attribute foo="bar" bar="banana" /]' );
	});

	it( 'Reverses the effect of core adding wpautop to shortcode inner content', function(){
		var shortcode = {
			tag: 'pullquote',
			content: 'This quote has</p>\n<p>Multiple line breaks two</p>\n<p>Test one',
			type: 'closed',
			attrs: {
				named: {},
				numeric: [],
			}
		};
		var data = {
			label: 'Pullquote',
			shortcode_tag: 'pullquote',
			inner_content: true,
		};
		sui.shortcodes.add( data );
		var model = ShortcodeViewConstructor.getShortcodeModel( shortcode );
		expect( model.get('inner_content').get('value') ).toEqual( 'This quote has\n\nMultiple line breaks two\n\nTest one' );
	});

	it( 'Reverses the effect of core adding wpautop to shortcode attribute', function(){
		var shortcode = {
			tag: 'pullquote_attr',
			attrs: {
				named: {
					quote: 'This quote has</p>\n<p>Multiple line breaks two</p>\n<p>Test one',
				},
			},
			type: 'single',
			content: null,
		};
		var data = {
			label: 'Pullquote',
			shortcode_tag: 'pullquote_attr',
			attrs: [
				{
					attr: 'quote',
					label: 'Quote',
					type: 'text',
				}
			],
		};
		sui.shortcodes.add( data );
		var model = ShortcodeViewConstructor.getShortcodeModel( shortcode );
		expect( model.get('attrs').first().get('value') ).toEqual( 'This quote has\n\nMultiple line breaks two\n\nTest one' );
	});

	it( 'Can parse shortcode content idempotently', function() {
		sui.shortcodes.add({
			label: 'Test Label',
			shortcode_tag: 'no_custom_content',
			attrs: [
				{
					attr:        'foo',
					label:       'Attribute',
					type:        'text',
					value:       'test value',
					placeholder: 'test placeholder',
				}
			]
		});
    var shortcodeString = '[no_custom_content foo="bar"]';
		var firstCall = ShortcodeViewConstructor.parseShortcodeString( shortcodeString );
		var secondCall = ShortcodeViewConstructor.parseShortcodeString( shortcodeString );
		expect( secondCall ).toBeDefined();
	});


	it( 'Select field can maintain order of options.', function() {

		var shortcode = new Shortcode({
			label: 'Test',
			shortcode_tag: 'test',
			attrs: [
				// Legacy option format
				{
					attr:        'foo',
					label:       'Foo',
					type:        'select',
					options:     { x: '1', z: '2', y: '3' },
				},
				// New array of object format
				{
					attr:        'foo',
					label:       'Foo',
					type:        'select',
					options:     [
						{ value: 'x', label: '1' },
						{ value: 'z', label: '2' },
						{ value: 'y', label: '3' },
					]
				}
			]
		});

		var view = new EditAttributeField( { model: shortcode } );
		var opt1 = view.parseOptions( shortcode.get('attrs').at(0).get('options') );
		var opt2 = view.parseOptions( shortcode.get('attrs').at(1).get('options') );

		expect( Array.isArray( opt1 ) ).toBe( true );
		expect( Array.isArray( opt2 ) ).toBe( true );
		expect( opt1[1].value ).toEqual( 'z' );
		expect( opt1[1].label ).toEqual( '2' );
		expect( opt2[1].value ).toEqual( 'z' );
		expect( opt2[1].label ).toEqual( '2' );

	});

	it( 'Can correctly decode encoded attribute values.', function() {
		sui.shortcodes.add({
			label: 'Shortcode with Encoded attribute values',
			shortcode_tag: 'encoded_attrs',
			attrs: [
				{
					attr:    'foo',
					type:    'text',
					encode:  true,
				}
			]
		});
		var shortcode = {
			'type':  'single',
			'tag':   'encoded_attrs',
			'attrs': {
				'named': {
					'foo': 'This%20100%26%2337%3B%20encoded%20attr%20has%20a%20percent%20%22%26%2337%3B%22%20character%20in%20it.',
				},
			},
		};

		var model = ShortcodeViewConstructor.getShortcodeModel( shortcode );
		expect( model.get('attrs').first().get('value') )
			.toEqual( 'This 100% encoded attr has a percent "%" character in it.' );
	});
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../js/src/models/shortcode":12,"../../js/src/utils/shortcode-view-constructor":14,"../../js/src/utils/sui":15,"../../js/src/views/edit-attribute-field":16}],5:[function(require,module,exports){
(function (global){
var Shortcode = require('./../../../js/src/models/shortcode.js');
var MceViewConstructor = require('./../../../js/src/utils/shortcode-view-constructor.js');
var sui = require('./../../../js/src/utils/sui.js');
var jQuery = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var wp = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null);

describe( "MCE View Constructor", function() {

	beforeEach( function() {
		wp.shortcode.regexp = function( tag ) {
			return new RegExp( '\\[(\\[?)(' + tag + ')(?![\\w-])([^\\]\\/]*(?:\\/(?!\\])[^\\]\\/]*)*?)(?:(\\/)\\]|\\](?:([^\\[]*(?:\\[(?!\\/\\2\\])[^\\[]*)*)(\\[\\/\\2\\]))?)(\\]?)', 'g' );
		};
	});

	sui.shortcodes.push( new Shortcode( {
		label: 'Test Label',
		shortcode_tag: 'test_shortcode',
		attrs: [
			{
				attr:        'attr',
				label:       'Attribute',
			}
		],
		inner_content: {
			value: 'test content',
		},
	} ) );

	sui.shortcodes.push( new Shortcode( {
		label: 'Test shortcode with dash',
		shortcode_tag: 'test-shortcode',
		attrs: [
			{
				attr:        'test-attr',
				label:       'Test attribute with dash',
			}
		],
		inner_content: {
			value: 'test content',
		},
	} ) );

	sui.shortcodes.push( new Shortcode( {
		label: 'Test Label',
		shortcode_tag: 'test_shortcode_encoded',
		attrs: [
			{
				attr:   'attr',
				label:  'Attribute',
				encode: true,
			}
		],
	} ) );

	it ( 'test get shortcode model', function() {

		var constructor = jQuery.extend( true, {}, MceViewConstructor );

		constructor.shortcode = {
			tag: "test_shortcode",
			attrs: {
				named: {
					attr: "Vestibulum ante ipsum primis"
				},
			},
			content: "Mauris iaculis porttitor posuere."
		};

		constructor.shortcodeModel = constructor.getShortcodeModel( constructor.shortcode );
		expect( constructor.shortcodeModel instanceof Shortcode ).toEqual( true );
		expect( constructor.shortcodeModel.get( 'attrs' ).first().get( 'value' ) ).toEqual( 'Vestibulum ante ipsum primis' );
		expect( constructor.shortcodeModel.get( 'inner_content' ).get( 'value' ) ).toEqual( 'Mauris iaculis porttitor posuere.' );

	} );

	describe( "Fetch preview HTML", function() {

		beforeEach(function() {
			jasmine.Ajax.install();
		});

		afterEach(function() {
			jasmine.Ajax.uninstall();
		});

		var constructor = jQuery.extend( true, {
			render: function( force ) {},
		}, MceViewConstructor );

		// Mock shortcode model data.
		constructor.shortcodeModel = jQuery.extend( true, {}, sui.shortcodes.first() );

		it( 'Fetches data success', function(){

			spyOn( wp.ajax, "post" ).and.callThrough();
			spyOn( constructor, "render" );

			constructor.fetch();

			expect( constructor.fetching ).toEqual( true );
			expect( constructor.content ).toEqual( undefined );
			expect( wp.ajax.post ).toHaveBeenCalled();
			expect( constructor.render ).not.toHaveBeenCalled();

			jasmine.Ajax.requests.mostRecent().respondWith( {
				'status': 200,
				'responseText': '{"success":true,"data":"test preview response body"}'
			} );

			expect( constructor.fetching ).toEqual( undefined );
			expect( constructor.content ).toEqual( 'test preview response body' );
			expect( constructor.render ).toHaveBeenCalled();

		});

		it( 'Handles errors when fetching data', function() {

			spyOn( constructor, "render" );

			constructor.fetch();

			jasmine.Ajax.requests.mostRecent().respondWith( {
				'status': 500,
				'responseText': '{"success":false}'
			});

			expect( constructor.fetching ).toEqual( undefined );
			expect( constructor.content ).toContain( 'shortcake-error' );
			expect( constructor.render ).toHaveBeenCalled();

		} );

	} );

	it( 'parses simple shortcode', function() {
		var shortcode = MceViewConstructor.parseShortcodeString( '[test_shortcode attr="test value"]');
		expect( shortcode instanceof Shortcode ).toEqual( true );
		expect( shortcode.get( 'attrs' ).findWhere( { attr: 'attr' }).get('value') ).toEqual( 'test value' );
	});

	it( 'parses shortcode with content', function() {
		var shortcode = MceViewConstructor.parseShortcodeString( '[test_shortcode attr="test value 1"]test content[/test_shortcode]');
		expect( shortcode instanceof Shortcode ).toEqual( true );
		expect( shortcode.get( 'attrs' ).findWhere( { attr: 'attr' }).get('value') ).toEqual( 'test value 1' );
		expect( shortcode.get( 'inner_content' ).get('value') ).toEqual( 'test content' );
	});

	it( 'parses shortcode with dashes in name and attribute', function() {
		var shortcode = MceViewConstructor.parseShortcodeString( '[test-shortcode test-attr="test value 2"]');
		expect( shortcode instanceof Shortcode ).toEqual( true );
		expect( shortcode.get( 'attrs' ).findWhere( { attr: 'test-attr' }).get('value') ).toEqual( 'test value 2' );
	});

	// https://github.com/fusioneng/Shortcake/issues/171
	it( 'parses shortcode with line breaks in inner content', function() {
		var shortcode = MceViewConstructor.parseShortcodeString( "[test_shortcode]test \ntest \rtest[/test_shortcode]");
		expect( shortcode instanceof Shortcode ).toEqual( true );
		expect( shortcode.get( 'inner_content' ).get('value') ).toEqual( "test \ntest \rtest" );
	} );

	it( 'parses shortcode with paragraph and br tags in inner content', function() {
		var shortcode = MceViewConstructor.parseShortcodeString( "[test_shortcode]<p>test</p><p>test<br/>test</p>[/test_shortcode]");
		expect( shortcode instanceof Shortcode ).toEqual( true );
		expect( shortcode.get( 'inner_content' ).get('value') ).toEqual( "test\n\ntest\ntest" );
	} );

	it( 'parses shortcode with unquoted attributes', function() {
		var shortcode = MceViewConstructor.parseShortcodeString( '[test_shortcode attr=test]');
		expect( shortcode instanceof Shortcode ).toEqual( true );
		expect( shortcode.get( 'attrs' ).findWhere( { attr: 'attr' }).get('value') ).toEqual( 'test' );
	});

	// See https://github.com/fusioneng/Shortcake/issues/495
	xit( 'parses shortcode with hyphened-attribute', function() {
		var shortcode = MceViewConstructor.parseShortcodeString( '[test-shortcode test-attr=test]');
		expect( shortcode instanceof Shortcode ).toEqual( true );
		expect( shortcode.get( 'attrs' ).findWhere( { attr: 'test-attr' }).get('value') ).toEqual( 'test' );
	});

	it( 'parses shortcode with encoded attribute', function() {
		var shortcode = MceViewConstructor.parseShortcodeString( '[test_shortcode_encoded attr="%3Cb%20class%3D%22foo%22%3Ebar%3C%2Fb%3E"]');
		expect( shortcode instanceof Shortcode ).toEqual( true );
		expect( shortcode.get( 'attrs' ).findWhere({ attr: 'attr' }).get('value') ).toEqual( '<b class="foo">bar</b>' );
	});

} );

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../../../js/src/models/shortcode.js":12,"./../../../js/src/utils/shortcode-view-constructor.js":14,"./../../../js/src/utils/sui.js":15}],6:[function(require,module,exports){
var Shortcodes = require('./../../../js/src/collections/shortcodes.js');
var sui = require('./../../../js/src/utils/sui.js');

describe( "SUI Util", function() {

	it( 'sets global variable', function() {
		expect( window.Shortcode_UI ).toEqual( sui );
	});

	it( 'expected properties', function() {
		expect( sui.shortcodes instanceof Shortcodes ).toEqual( true );
		expect( typeof sui.views === 'object' ).toBe( true );
		expect( sui.views.editAttributeField ).not.toBe( undefined );
	});

} );

},{"./../../../js/src/collections/shortcodes.js":9,"./../../../js/src/utils/sui.js":15}],7:[function(require,module,exports){
(function (global){
var Shortcode = require('../../../js/src/models/shortcode');
var ShortcodeAttribute = require('../../../js/src/models/shortcode-attribute');
var EditAttributeField = require('../../../js/src/views/edit-attribute-field');
var sui = require('../../../js/src/utils/sui');
var hooks = require('../../../lib/wp-js-hooks/wp-js-hooks.js');
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

describe( 'Edit Attribute Field', function(){
	var editAttributeFieldView, shortcodeAttributeModel, attrData, shortcodeModel, shortcodeData, templateFunc;

	shortcodeData = {
		label: 'Test Label',
		shortcode_tag: 'test_shortcode',
		attrs: [
			{
				attr:        'attr',
				label:       'Attribute',
				type:        'text',
				value:       'test value',
				placeholder: 'test placeholder'
			}
		],
		inner_content: {
			value: 'test content',
		},
	};

	shortcodeModel = new Shortcode( shortcodeData );

	shortcodeAttributeModel = new ShortcodeAttribute(
		shortcodeModel.get('attrs').models[0].attributes
	);

	editAttributeFieldView = new EditAttributeField({ model: shortcodeAttributeModel });
	editAttributeFieldView.shortcode = shortcodeModel;
	editAttributeFieldView.template = function( data ) {};

	it( 'should set data and trigger callbacks on initial render', function(){
		spyOn( editAttributeFieldView, 'triggerCallbacks' );
		spyOn( editAttributeFieldView, 'template' );

		editAttributeFieldView.render();
		expect( editAttributeFieldView.triggerCallbacks ).toHaveBeenCalled();
		expect( editAttributeFieldView.template ).toHaveBeenCalled();
	});

	xit( 'triggers callbacks with expected values', function(){
		wp.shortcake.hooks.addAction( 'test_shortcode.attr1', 'attr1RenderCallback' );
		window.attr1RenderCallback = function(){};

		spyOn( window, 'attr1RenderCallback' );
	});

	describe( 'Select field', function() {
		var selectFieldAttribute, selectFieldView, selectFieldModel;

		selectFieldAttribute = {
			attr: 'select_field',
			label: 'Select Attribute Field',
			type: 'select',
			options: {
				one: 'one',
				two: 'two',
				three: 'three'
			}
		};

		shortcodeData.attrs = [ selectFieldAttribute ];
		shortcodeModel = new Shortcode( shortcodeData );

		selectFieldModel = new ShortcodeAttribute(
			shortcodeModel.get('attrs').models[0].attributes
		);
		selectFieldView = new EditAttributeField({ model: selectFieldModel });
		selectFieldView.shortcode = shortcodeModel;
		selectFieldView.template = selectFieldView.triggerCallbacks =  function( data ) {};
		selectFieldView.template = function( data ) {};

		it( 'should use first option as the default if no empty option is set', function() {
			selectFieldView.render();
			expect( selectFieldModel.get( 'value' ) ).toBe( 'one' );
		});

		it( 'should respect selected value if one is already set', function() {
			selectFieldView.setValue( 'two' );
			selectFieldView.render();
			expect( selectFieldModel.get( 'value' ) ).toBe( 'two' );
		});
	});

	describe( 'Select field with null attribute', function() {
		var selectFieldAttribute, selectFieldView, selectFieldModel;

		selectFieldAttribute = {
			attr: 'select_field',
			label: 'Select Attribute Field',
			type: 'select',
			options: {
				one: 'one',
				two: 'two',
				'': 'no value',
				three: 'three'
			}
		};

		shortcodeData.attrs = [ selectFieldAttribute ];
		shortcodeModel = new Shortcode( shortcodeData );

		selectFieldModel = new ShortcodeAttribute(
			shortcodeModel.get('attrs').models[0].attributes
		);
		selectFieldView = new EditAttributeField({ model: selectFieldModel });
		selectFieldView.shortcode = shortcodeModel;
		selectFieldView.template = selectFieldView.triggerCallbacks =  function( data ) {};
		selectFieldView.template = function( data ) {};

		it( 'should not use first option as the default if an empty option is set', function() {
			selectFieldView.render();
			expect( selectFieldModel.get( 'value' ) ).toBe( '' );
		});
	});

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../../js/src/models/shortcode":12,"../../../js/src/models/shortcode-attribute":11,"../../../js/src/utils/sui":15,"../../../js/src/views/edit-attribute-field":16,"../../../lib/wp-js-hooks/wp-js-hooks.js":17}],8:[function(require,module,exports){
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
},{"./../models/shortcode-attribute.js":11}],9:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
var Shortcode = require('./../models/shortcode.js');

// Shortcode Collection
var Shortcodes = Backbone.Collection.extend({
	model : Shortcode
});

module.exports = Shortcodes;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../models/shortcode.js":12}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
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
},{}],12:[function(require,module,exports){
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
},{"./../collections/shortcode-attributes.js":8,"./inner-content.js":10}],13:[function(require,module,exports){
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
},{}],14:[function(require,module,exports){
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
			shortcode: this.shortcodeModel.formatShortcode()
		});
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
},{"./fetcher.js":13,"./sui.js":15}],15:[function(require,module,exports){
var Shortcodes = require('./../collections/shortcodes.js');

window.Shortcode_UI = window.Shortcode_UI || {
	shortcodes: new Shortcodes(),
	views: {},
	controllers: {},
	utils: {},
};

module.exports = window.Shortcode_UI;

},{"./../collections/shortcodes.js":9}],16:[function(require,module,exports){
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
},{"./../utils/sui.js":15}],17:[function(require,module,exports){
/**
 * This code is taken from @carldanley's WP-JS-Hooks library:
 * https://github.com/carldanley/WP-JS-Hooks
 *
 * This is a basic event manager based on the one proposed for WordPress core
 * in https://core.trac.wordpress.org/attachment/ticket/21170.
 *
 * Modifications for this plugin: The EventManager methods are all namespaced
 * to `wp.shortcake.hooks` to avoid collisions with the proposed system of
 * hooks for core, which are intended to be adopted at `wp.hooks`.  However, we
 * plan to keep basic feature parity and interoperability with the proposed JS
 * hooks and filters system for core, with the end goal of using the same API
 * as what is finally decided on there.
 */

( function( window, undefined ) {
	'use strict';

	/**
	 * Handles managing all events for whatever you plug it into. Priorities for hooks are based on lowest to highest in
	 * that, lowest priority hooks are fired first.
	 */
	var EventManager = function() {
		var slice = Array.prototype.slice;

		/**
		 * Maintain a reference to the object scope so our public methods never get confusing.
		 */
		var MethodsAvailable = {
			removeFilter : removeFilter,
			applyFilters : applyFilters,
			addFilter : addFilter,
			removeAction : removeAction,
			doAction : doAction,
			addAction : addAction
		};

		/**
		 * Contains the hooks that get registered with this EventManager. The array for storage utilizes a "flat"
		 * object literal such that looking up the hook utilizes the native object literal hash.
		 */
		var STORAGE = {
			actions : {},
			filters : {}
		};

		/**
		 * Adds an action to the event manager.
		 *
		 * @param action Must contain namespace.identifier
		 * @param callback Must be a valid callback function before this action is added
		 * @param [priority=10] Used to control when the function is executed in relation to other callbacks bound to the same hook
		 * @param [context] Supply a value to be used for this
		 */
		function addAction( action, callback, priority, context ) {
			if( typeof action === 'string' && typeof callback === 'function' ) {
				priority = parseInt( ( priority || 10 ), 10 );
				_addHook( 'actions', action, callback, priority, context );
			}

			return MethodsAvailable;
		}

		/**
		 * Performs an action if it exists. You can pass as many arguments as you want to this function; the only rule is
		 * that the first argument must always be the action.
		 */
		function doAction( /* action, arg1, arg2, ... */ ) {
			var args = slice.call( arguments );
			var action = args.shift();

			if( typeof action === 'string' ) {
				_runHook( 'actions', action, args );
			}

			return MethodsAvailable;
		}

		/**
		 * Removes the specified action if it contains a namespace.identifier & exists.
		 *
		 * @param action The action to remove
		 * @param [callback] Callback function to remove
		 */
		function removeAction( action, callback ) {
			if( typeof action === 'string' ) {
				_removeHook( 'actions', action, callback );
			}

			return MethodsAvailable;
		}

		/**
		 * Adds a filter to the event manager.
		 *
		 * @param filter Must contain namespace.identifier
		 * @param callback Must be a valid callback function before this action is added
		 * @param [priority=10] Used to control when the function is executed in relation to other callbacks bound to the same hook
		 * @param [context] Supply a value to be used for this
		 */
		function addFilter( filter, callback, priority, context ) {
			if( typeof filter === 'string' && typeof callback === 'function' ) {
				priority = parseInt( ( priority || 10 ), 10 );
				_addHook( 'filters', filter, callback, priority, context );
			}

			return MethodsAvailable;
		}

		/**
		 * Performs a filter if it exists. You should only ever pass 1 argument to be filtered. The only rule is that
		 * the first argument must always be the filter.
		 */
		function applyFilters( /* filter, filtered arg, arg2, ... */ ) {
			var args = slice.call( arguments );
			var filter = args.shift();

			if( typeof filter === 'string' ) {
				return _runHook( 'filters', filter, args );
			}

			return MethodsAvailable;
		}

		/**
		 * Removes the specified filter if it contains a namespace.identifier & exists.
		 *
		 * @param filter The action to remove
		 * @param [callback] Callback function to remove
		 */
		function removeFilter( filter, callback ) {
			if( typeof filter === 'string') {
				_removeHook( 'filters', filter, callback );
			}

			return MethodsAvailable;
		}

		/**
		 * Removes the specified hook by resetting the value of it.
		 *
		 * @param type Type of hook, either 'actions' or 'filters'
		 * @param hook The hook (namespace.identifier) to remove
		 * @private
		 */
		function _removeHook( type, hook, callback, context ) {
			var handlers, handler, i;

			if ( !STORAGE[ type ][ hook ] ) {
				return;
			}
			if ( !callback ) {
				STORAGE[ type ][ hook ] = [];
			} else {
				handlers = STORAGE[ type ][ hook ];
				if ( !context ) {
					for ( i = handlers.length; i--; ) {
						if ( handlers[i].callback === callback ) {
							handlers.splice( i, 1 );
						}
					}
				}
				else {
					for ( i = handlers.length; i--; ) {
						handler = handlers[i];
						if ( handler.callback === callback && handler.context === context) {
							handlers.splice( i, 1 );
						}
					}
				}
			}
		}

		/**
		 * Adds the hook to the appropriate storage container
		 *
		 * @param type 'actions' or 'filters'
		 * @param hook The hook (namespace.identifier) to add to our event manager
		 * @param callback The function that will be called when the hook is executed.
		 * @param priority The priority of this hook. Must be an integer.
		 * @param [context] A value to be used for this
		 * @private
		 */
		function _addHook( type, hook, callback, priority, context ) {
			var hookObject = {
				callback : callback,
				priority : priority,
				context : context
			};

			// Utilize 'prop itself' : http://jsperf.com/hasownproperty-vs-in-vs-undefined/19
			var hooks = STORAGE[ type ][ hook ];
			if( hooks ) {
				hooks.push( hookObject );
				hooks = _hookInsertSort( hooks );
			}
			else {
				hooks = [ hookObject ];
			}

			STORAGE[ type ][ hook ] = hooks;
		}

		/**
		 * Use an insert sort for keeping our hooks organized based on priority. This function is ridiculously faster
		 * than bubble sort, etc: http://jsperf.com/javascript-sort
		 *
		 * @param hooks The custom array containing all of the appropriate hooks to perform an insert sort on.
		 * @private
		 */
		function _hookInsertSort( hooks ) {
			var tmpHook, j, prevHook;
			for( var i = 1, len = hooks.length; i < len; i++ ) {
				tmpHook = hooks[ i ];
				j = i;
				while( ( prevHook = hooks[ j - 1 ] ) &&  prevHook.priority > tmpHook.priority ) {
					hooks[ j ] = hooks[ j - 1 ];
					--j;
				}
				hooks[ j ] = tmpHook;
			}

			return hooks;
		}

		/**
		 * Runs the specified hook. If it is an action, the value is not modified but if it is a filter, it is.
		 *
		 * @param type 'actions' or 'filters'
		 * @param hook The hook ( namespace.identifier ) to be ran.
		 * @param args Arguments to pass to the action/filter. If it's a filter, args is actually a single parameter.
		 * @private
		 */
		function _runHook( type, hook, args ) {
			var handlers = STORAGE[ type ][ hook ], i, len;

			if ( !handlers ) {
				return (type === 'filters') ? args[0] : false;
			}

			len = handlers.length;
			if ( type === 'filters' ) {
				for ( i = 0; i < len; i++ ) {
					args[ 0 ] = handlers[ i ].callback.apply( handlers[ i ].context, args );
				}
			} else {
				for ( i = 0; i < len; i++ ) {
					handlers[ i ].callback.apply( handlers[ i ].context, args );
				}
			}

			return ( type === 'filters' ) ? args[ 0 ] : true;
		}

		// return all of the publicly available methods
		return MethodsAvailable;

	};

	window.wp = window.wp || {};
	window.wp.shortcake = window.wp.shortcake || {};
	window.wp.shortcake.hooks = new EventManager();

} )( window );

},{}]},{},[1,2,3,4,5,6,7]);
