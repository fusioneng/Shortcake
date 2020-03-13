<?php

/**
 * Primary controller class for Shortcake
 */
class Shortcode_UI {

	/**
	 * Path to the plugin directory.
	 *
	 * @access private
	 * @var string
	 */
	private $plugin_dir;

	/**
	 * Plugin URL.
	 *
	 * @access private
	 * @var string
	 */
	private $plugin_url;

	/**
	 * Shortcodes with registered shortcode UI.
	 *
	 * @access private
	 * @var array
	 */
	private $shortcodes = array();

	/**
	 * Shortcake controller instance.
	 *
	 * @access private
	 * @var object
	 */
	private static $instance;

	/**
	 * Select2 library handle.
	 *
	 * @access public
	 * @var string
	 */
	public static $select2_handle = 'select2';

	/**
	 * Get instance of Shortcake controller.
	 *
	 * Instantiates object on the fly when not already loaded.
	 *
	 * @return object
	 */
	public static function get_instance() {
		if ( ! isset( self::$instance ) ) {
			self::$instance = new self;
			self::$instance->setup_actions();
		}
		return self::$instance;
	}

	/**
	 * Set up instance attributes when initially loaded.
	 */
	private function __construct() {
		$this->plugin_version = SHORTCODE_UI_VERSION;
		$this->plugin_dir     = plugin_dir_path( dirname( __FILE__ ) );
		$this->plugin_url     = plugin_dir_url( dirname( __FILE__ ) );
	}

	/**
	 * Setup plugin actions.
	 */
	private function setup_actions() {
		add_action( 'admin_notices', array( $this, 'action_admin_notices' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'action_admin_enqueue_scripts' ) );
		add_action( 'wp_enqueue_editor', array( $this, 'action_wp_enqueue_editor' ) );
		add_action( 'media_buttons', array( $this, 'action_media_buttons' ) );
		add_action( 'wp_ajax_bulk_do_shortcode', array( $this, 'handle_ajax_bulk_do_shortcode' ) );
		add_filter( 'wp_editor_settings', array( $this, 'filter_wp_editor_settings' ), 10, 2 );
	}

	/**
	 * Display an admin notice on activation.
	 *
	 * If no shortcodes with Shortcake UI are registered, this Will display a link to the plugin's wiki for examples.
	 * If there are already plugins with UI registered, will just display a success message.
	 *
	 * @return void
	 */
	public function action_admin_notices() {
		if ( ! get_option( 'shortcode_ui_activation_notice' ) ) {
			return;
		}

		if ( ! $this->has_shortcodes() ) {
			echo '<div class="notice notice-warning is-dismissable"><p>' .
				sprintf(
					wp_kses(
						/* Translators: link to plugin wiki page with examples of shortcodes supporting Shortcake UI */
						__( 'The Shortcode UI plugin will not do anything unless UI is registered for shortcodes through a theme or plugins. For examples, see <a href="%s" target="_blank">here</a>.', 'shortcode-ui' ),
						array(
							'a' => array(
								'href'   => array(),
								'target' => array(),
							),
						)
					),
					'https://github.com/wp-shortcake/shortcake/wiki/Shortcode-UI-Examples'
				) .
				'</p></div>' . "\n";
		} else {
			echo '<div class="notice notice-info is-dismissable"><p>' .
				esc_html__( 'Shortcode UI is installed. Try out the shortcode UI through the "Add Post element" button in the post edit screen.', 'shortcode-ui' ) .
				'</p></div>' . "\n";
		}

		delete_option( 'shortcode_ui_activation_notice' );
	}

	/**
	 * When a WP_Editor is initialized on a page, call the 'register_shortcode_ui' action.
	 *
	 * This action can be used to register styles and shortcode UI for any
	 * shortcake-powered shortcodes, only on views which actually include a WP
	 * Editor.
	 */
	public function filter_wp_editor_settings( $settings, $editor_id ) {

		if ( ! did_action( 'register_shortcode_ui' ) ) {

			/**
			 * Register shortcode UI for shortcodes.
			 *
			 * Can be used to register shortcode UI only when an editor is being enqueued.
			 *
			 * @param array $settings Settings array for the ective WP_Editor.
			 */
			do_action( 'register_shortcode_ui', $settings, $editor_id );
		}

		return $settings;
	}

	/**
	 * Register UI for a shortcode.
	 *
	 * @param string $shortcode_tag Tag used for the shortcode.
	 * @param array $args Configuration parameters for shortcode UI.
	 */
	public function register_shortcode_ui( $shortcode_tag, $args = array() ) {

		// inner_content=true is a valid argument, but we want more detail
		if ( isset( $args['inner_content'] ) && true === $args['inner_content'] ) {
			$args['inner_content'] = array(
				'label'       => esc_html__( 'Inner Content', 'shortcode-ui' ),
				'description' => '',
			);
		}

		if ( ! isset( $args['attrs'] ) ) {
			$args['attrs'] = array();
		}

		$args['shortcode_tag']              = $shortcode_tag;
		$this->shortcodes[ $shortcode_tag ] = $args;

		// Setup filter to handle decoding encoded attributes.
		add_filter( "shortcode_atts_{$shortcode_tag}", array( $this, 'filter_shortcode_atts_decode_encoded' ), 5, 3 );

	}

	/**
	 * Get configuration parameters for all shortcodes with UI.
	 *
	 * @return array
	 */
	public function get_shortcodes() {

		if ( ! did_action( 'register_shortcode_ui' ) ) {

			/**
			 * Register shortcode UI for shortcodes.
			 *
			 * Can be used to register shortcode UI only when an editor is being enqueued.
			 *
			 * @param array $settings Settings array for the ective WP_Editor.
			 */
			do_action( 'register_shortcode_ui', array(), '' );
		}

		/**
		 * Filter the returned shortcode UI configuration parameters.
		 *
		 * Used to remove shortcode UI that's already been registered.
		 *
		 * @param array $shortcodes
		 */
		$shortcodes = apply_filters( 'shortcode_ui_shortcodes', $this->shortcodes );

		foreach ( $shortcodes as $shortcode => $args ) {

			foreach ( $args['attrs'] as $key => $value ) {
				foreach ( array( 'label', 'description' ) as $field ) {
					if ( ! empty( $value[ $field ] ) ) {
						$shortcodes[ $shortcode ]['attrs'][ $key ][ $field ] = wp_kses_post( $value[ $field ] );
					}
				}
			}

			foreach ( array( 'label', 'description' ) as $field ) {
				if ( ! empty( $args['inner_content'][ $field ] ) ) {
					$shortcodes[ $shortcode ]['inner_content'][ $field ] = wp_kses_post( $args['inner_content'][ $field ] );
				}
			}

		}

		return $shortcodes;
	}

	/**
	 * Whether any shortcodes with UI are registered
	 *
	 * @return bool
	 */
	public function has_shortcodes() {
		return (bool) $this->get_shortcodes();
	}

	/**
	 * Get UI configuration parameters for a given shortcode.
	 *
	 * @return array|false
	 */
	public function get_shortcode( $shortcode_tag ) {

		$shortcodes = $this->get_shortcodes();
		if ( isset( $shortcodes[ $shortcode_tag ] ) ) {
			return $shortcodes[ $shortcode_tag ];
		}
		return false;
	}

	/**
	 * Enqueue scripts and styles used in the admin.
	 *
	 * Editor styles needs to be added before wp_enqueue_editor.
	 *
	 * @param array $editor_supports Whether or not the editor being enqueued has 'tinymce' or 'quicktags'
	 */
	public function action_admin_enqueue_scripts( $editor_supports ) {
		add_editor_style( trailingslashit( $this->plugin_url ) . 'css/shortcode-ui-editor-styles.css' );

		$min = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min';

		wp_register_script(
			self::$select2_handle,
			trailingslashit( $this->plugin_url ) . "lib/select2/js/select2.full{$min}.js",
			array( 'jquery', 'jquery-ui-sortable' ), '4.0.3'
		);

		if ( 'select2' !== self::$select2_handle ) {
			wp_add_inline_script( self::$select2_handle, 'var existingSelect2 = jQuery.fn.select2 || null; if (existingSelect2) { delete jQuery.fn.select2; }', 'before' );
			wp_add_inline_script( self::$select2_handle, 'jQuery.fn[ shortcodeUIData.select2_handle ] = jQuery.fn.select2; if (existingSelect2) { delete jQuery.fn.select2; jQuery.fn.select2 = existingSelect2; }', 'after' );
		}

		wp_register_style(
			self::$select2_handle,
			trailingslashit( $this->plugin_url ) . "lib/select2/css/select2{$min}.css",
			null, '4.0.3'
		);
	}

	/**
	 * Enqueue scripts and styles needed for shortcode UI.
	 */
	public function enqueue() {

		if ( did_action( 'enqueue_shortcode_ui' ) ) {
			return;
		}

		wp_enqueue_media();

		$shortcodes        = array_values( $this->get_shortcodes() );
		$current_post_type = get_post_type();
		if ( $current_post_type ) {
			foreach ( $shortcodes as $key => $args ) {
				if ( ! empty( $args['post_type'] ) && ! in_array( $current_post_type, $args['post_type'], true ) ) {
					unset( $shortcodes[ $key ] );
				}
			}
		}

		if ( empty( $shortcodes ) ) {
			return;
		}

		usort( $shortcodes, array( $this, 'compare_shortcodes_by_label' ) );

		// Load minified version of wp-js-hooks if not debugging.
		$wp_js_hooks_file = 'wp-js-hooks' . ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min' ) . '.js';

		wp_enqueue_script( 'shortcode-ui-js-hooks', $this->plugin_url . 'lib/wp-js-hooks/' . $wp_js_hooks_file, array(), '2015-03-19' );
		wp_enqueue_script( 'shortcode-ui', $this->plugin_url . 'js/build/shortcode-ui.js', array( 'jquery', 'backbone', 'mce-view', 'shortcode-ui-js-hooks' ), $this->plugin_version );
		wp_enqueue_style( 'shortcode-ui', $this->plugin_url . 'css/shortcode-ui.css', array(), $this->plugin_version );
		wp_localize_script(
			'shortcode-ui', ' shortcodeUIData', array(
				'shortcodes'     => $shortcodes,
				'strings'        => array(
					'media_frame_title'                 => __( 'Insert Post Element', 'shortcode-ui' ),
					'media_frame_menu_insert_label'     => __( 'Insert Post Element', 'shortcode-ui' ),
					/* Translators: Ignore placeholder. This is replaced with the Shortcode name string in JS */
					'media_frame_menu_update_label'     => __( '%s Details', 'shortcode-ui' ),
					'media_frame_toolbar_insert_label'  => __( 'Insert Element', 'shortcode-ui' ),
					'media_frame_toolbar_update_label'  => __( 'Update', 'shortcode-ui' ),
					'media_frame_no_attributes_message' => __( 'There are no attributes to configure for this Post Element.', 'shortcode-ui' ),
					'mce_view_error'                    => __( 'Failed to load preview', 'shortcode-ui' ),
					'search_placeholder'                => __( 'Search', 'shortcode-ui' ),
					'insert_content_label'              => __( 'Insert Content', 'shortcode-ui' ),
				),
				'nonces'         => array(
					'preview'        => wp_create_nonce( 'shortcode-ui-preview' ),
					'thumbnailImage' => wp_create_nonce( 'shortcode-ui-get-thumbnail-image' ),
				),
				'select2_handle' => self::$select2_handle,
			)
		);

		// add templates to the footer, instead of where we're at now
		add_action( 'admin_print_footer_scripts', array( $this, 'action_admin_print_footer_scripts' ) );

		/**
		 * Fires after shortcode UI assets have been enqueued.
		 *
		 * Will only fire once per page load.
		 */
		do_action( 'enqueue_shortcode_ui' );
	}

	/**
	 * Enqueue shortcode UI assets when the editor is enqueued.
	 */
	public function action_wp_enqueue_editor() {
		$this->enqueue();
		/**
		 * Fires after shortcode UI assets have been loaded for the editor.
		 *
		 * Will fire every time the editor is loaded.
		 */
		do_action( 'shortcode_ui_loaded_editor' );
	}

	/**
	 * Output an "Add Post Element" button with the media buttons.
	 */
	public function action_media_buttons( $editor_id ) {
		if ( ! $this->has_shortcodes() ) {
			return;
		}

		printf(
			'<button type="button" class="button shortcake-add-post-element" data-editor="%s">' .
			'<span class="wp-media-buttons-icon dashicons dashicons-migrate"></span> %s' .
			'</button>',
			esc_attr( $editor_id ),
			esc_html__( 'Add Post Element', 'shortcode-ui' )
		);
	}

	/**
	 * Output required underscore.js templates in the footer
	 */
	public function action_admin_print_footer_scripts() {

		echo $this->get_view( 'media-frame' ); // WPCS: xss ok
		echo $this->get_view( 'list-item' ); // WPCS: xss ok
		echo $this->get_view( 'edit-form' ); // WPCS: xss ok

		/**
		 * Fires after base shortcode UI templates have been loaded.
		 *
		 * Allows custom shortcode UI field types to load their own templates.
		 */
		do_action( 'print_shortcode_ui_templates' );
	}

	/**
	 * Helper function for displaying a PHP template file.
	 *
	 * Template args array is extracted and passed to the template file.
	 *
	 * @param  string $template full template file path. Or name of template file in inc/templates.
	 * @return string                 the template contents
	 */
	public function get_view( $template ) {

		if ( ! file_exists( $template ) ) {

			$template_dir = $this->plugin_dir . 'inc/templates/';
			$template     = $template_dir . $template . '.tpl.php';

			if ( ! file_exists( $template ) ) {
				return '';
			}
		}

		ob_start();
		include $template;

		return ob_get_clean();
	}

	/**
	 * Sort labels alphabetically.
	 *
	 * @param array $a
	 * @param array $b
	 * @return int
	 */
	private function compare_shortcodes_by_label( $a, $b ) {
		return strcmp( $a['label'], $b['label'] );
	}

	/**
	 * Render a shortcode body for preview.
	 */
	private function render_shortcode_for_preview( $shortcode, $post_id = null ) {

		if ( ! defined( 'SHORTCODE_UI_DOING_PREVIEW' ) ) {
			define( 'SHORTCODE_UI_DOING_PREVIEW', true );
		}

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return esc_html__( "Something's rotten in the state of Denmark", 'shortcode-ui' );
		}

		if ( ! empty( $post_id ) ) {
			// @codingStandardsIgnoreStart
			global $post;
			$post = get_post( $post_id );
			setup_postdata( $post );
			// @codingStandardsIgnoreEnd
		}

		ob_start();
		/**
		 * Fires before shortcode is rendered in preview.
		 *
		 * @param string $shortcode Full shortcode including attributes
		 */
		do_action( 'shortcode_ui_before_do_shortcode', $shortcode );
		echo do_shortcode( $shortcode ); // WPCS: xss ok
		/**
		 * Fires after shortcode is rendered in preview.
		 *
		 * @param string $shortcode Full shortcode including attributes
		 */
		do_action( 'shortcode_ui_after_do_shortcode', $shortcode );

		return ob_get_clean();
	}

	/**
	 * Get a bunch of shortcodes to render in MCE preview.
	 */
	public function handle_ajax_bulk_do_shortcode() {
		check_ajax_referer( 'shortcode-ui-preview', 'nonce' );

		if ( is_array( $_POST['queries'] ) ) {

			$responses = array();

			foreach ( $_POST['queries'] as $posted_query ) {

				// Don't sanitize shortcodes — can contain HTML kses doesn't allow (e.g. sourcecode shortcode)
				if ( ! empty( $posted_query['shortcode'] ) ) {
					$shortcode = stripslashes( $posted_query['shortcode'] );
				} else {
					$shortcode = null;
				}
				if ( isset( $posted_query['post_id'] ) ) {
					$post_id = intval( $posted_query['post_id'] );
				} else {
					$post_id = null;
				}

				$responses[ $posted_query['counter'] ] = array(
					'query'    => $posted_query,
					'response' => $this->render_shortcode_for_preview( $shortcode, $post_id ),
				);
			}

			wp_send_json_success( $responses );
			exit;
		}

	}

	/**
	 * Decode any encoded attributes.
	 *
	 * @param array $out   The output array of shortcode attributes.
	 * @param array $pairs The supported attributes and their defaults.
	 * @param array $atts  The user defined shortcode attributes.
	 * @return array $out  The output array of shortcode attributes.
	 */
	public function filter_shortcode_atts_decode_encoded( $out, $pairs, $atts ) {

		// Get current shortcode tag from the current filter
		// by stripping `shortcode_atts_` from start of string.
		$shortcode_tag  = substr( current_filter(), 15 );
		$shortcode_args = $this->get_shortcode( $shortcode_tag );
		if ( ! $shortcode_args ) {
			return $out;
		}

		$fields = Shortcode_UI_Fields::get_instance()->get_fields();

		foreach ( $shortcode_args['attrs'] as $attr ) {

			$default = isset( $fields[ $attr['type'] ]['encode'] ) ? $fields[ $attr['type'] ]['encode'] : false;
			$encoded = isset( $attr['encode'] ) ? $attr['encode'] : $default;

			if ( $encoded && isset( $out[ $attr['attr'] ] ) ) {
				$out[ $attr['attr'] ] = rawurldecode( $out[ $attr['attr'] ] );
			}
		}

		return $out;

	}

}
