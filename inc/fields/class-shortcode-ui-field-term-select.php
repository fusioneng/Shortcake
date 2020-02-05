<?php

class Shortcode_UI_Field_Term_Select {

	private static $instance;

	// All registered post fields.
	private $post_fields = array();

	// Field Settings.
	private $fields = array(
		'term_select' => array(
			'template' => 'shortcode-ui-field-term-select',
			'view'     => 'editAttributeFieldTermSelect',
		),
	);

	/**
	 * Setup the instance.
	 * @return Shortcode_UI_Field_Term_Select
	 */
	public static function get_instance() {
		if ( ! isset( self::$instance ) ) {
			self::$instance = new self;
			self::$instance->setup_actions();
		}
		return self::$instance;
	}

	/**
	 * Add the required actions and filters.
	 */
	private function setup_actions() {
		add_filter( 'shortcode_ui_fields', array( $this, 'filter_shortcode_ui_fields' ) );
		add_action( 'enqueue_shortcode_ui', array( $this, 'action_enqueue_shortcode_ui' ) );
		add_action( 'wp_ajax_shortcode_ui_term_field', array( $this, 'action_wp_ajax_shortcode_ui_term_field' ) );
		add_action( 'shortcode_ui_loaded_editor', array( $this, 'action_shortcode_ui_loaded_editor' ) );
	}

	/**
	 * Add our field to the shortcode fields.
	 * @param $fields
	 *
	 * @return array
	 */
	public function filter_shortcode_ui_fields( $fields ) {
		return array_merge( $fields, $this->fields );
	}

	/**
	 * Add Select2 for our UI.
	 */
	public function action_enqueue_shortcode_ui() {

		wp_enqueue_script( Shortcode_UI::$select2_handle );
		wp_enqueue_style( Shortcode_UI::$select2_handle );

		wp_localize_script(
			'shortcode-ui', 'shortcodeUiTermFieldData', array(
				'nonce' => wp_create_nonce( 'shortcode_ui_field_term_select' ),
			)
		);
	}

	/**
	 * Prepare to output the templates required for this field in the footer.
	 */
	public function action_shortcode_ui_loaded_editor() {
		add_action( 'admin_print_footer_scripts', array( $this, 'output_templates' ) );
	}

	/**
	 * Output styles and templates used by term select field.
	 */
	public function output_templates() {
		?>

		<script type="text/html" id="tmpl-shortcode-ui-field-term-select">
			<div class="field-block shortcode-ui-field-term-select shortcode-ui-attribute-{{ data.attr }}">
				<label for="{{ data.id }}">{{{ data.label }}}</label>
				<select name="{{ data.attr }}" id="{{ data.id }}" class="shortcode-ui-term-select"></select>
				<# if ( typeof data.description == 'string' && data.description.length ) { #>
					<p class="description">{{{ data.description }}}</p>
				<# } #>
			</div>
		</script>

		<?php
	}

	/**
	 * Ajax handler for select2 post field queries.
	 * Output JSON containing post data.
	 * Requires that shortcode, attr and nonce are passed.
	 * Requires that the field has been correctly registered and can be found in $this->post_fields
	 * Supports passing page number and search query string.
	 *
	 * @return null
	 */
	public function action_wp_ajax_shortcode_ui_term_field() {

		$args                = array();
		$nonce               = isset( $_GET['nonce'] ) ? sanitize_text_field( $_GET['nonce'] ) : null;
		$requested_shortcode = isset( $_GET['shortcode'] ) ? sanitize_text_field( $_GET['shortcode'] ) : null;
		$requested_attr      = isset( $_GET['attr'] ) ? sanitize_text_field( $_GET['attr'] ) : null;
		$page                = isset( $_GET['page'] ) ? absint( $_GET['page'] ) : null;
		$search              = isset( $_GET['s'] ) ? sanitize_text_field( $_GET['s'] ) : '';

		$include = filter_input( INPUT_GET, 'include', FILTER_SANITIZE_NUMBER_INT, FILTER_REQUIRE_ARRAY );
		if ( ! is_array( $include ) ) {
			$include = (array) explode( ',', filter_input( INPUT_GET, 'include', FILTER_SANITIZE_STRING ) );
		}
		$include = array_filter( array_map( 'intval', $include ) );

		$response = array(
			'items'          => array(),
			'found_items'    => 0,
			'items_per_page' => 10,
			'page'           => $page,
		);

		if ( ! wp_verify_nonce( $nonce, 'shortcode_ui_field_term_select' ) ) {
			wp_send_json_error( $response );
		}

		$shortcodes = Shortcode_UI::get_instance()->get_shortcodes();

		// Shortcode not found.
		if ( ! isset( $shortcodes[ $requested_shortcode ] ) ) {
			wp_send_json_error( $response );
		}

		$shortcode = $shortcodes[ $requested_shortcode ];

		// Check to see if the taxonomy has been set.
		foreach ( $shortcode['attrs'] as $attr ) {
			if ( $attr['attr'] === $requested_attr && isset( $attr['taxonomy'] ) ) {
				$taxonomy_type = $attr['taxonomy'];
			}
		}

		// If the user hasn't specified a taxonomy then set it to post_tag.
		if ( empty( $taxonomy_type ) ) {
			$taxonomy_type = array( 'post_tag' );
		}

		$args['taxonomy']   = $taxonomy_type;
		$args['fields']     = 'all';
		$args['hide_empty'] = false;
		$args['number']     = 10;

		if ( ! empty( $include ) ) {
			$args['number']  = count( $include );
			$args['include'] = $include;
			$args['orderby'] = 'tag__in';
		}

		$term_search_min_chars = (int) apply_filters( 'term_search_min_chars', 2, $taxonomy_type, $search );

		if ( ( 0 !== $term_search_min_chars ) || ( strlen( $search ) > $term_search_min_chars ) ) {
			$args['name__like']         = $search;
			$response['terms_per_page'] = 10;
		}

		$num_results = wp_count_terms( $taxonomy_type, $args );

		if ( empty( $num_results ) ) {
			wp_send_json_error();
		}

		$response['found_items'] = absint( $num_results );

		if ( isset( $page ) ) {
			$args['page']   = $page;
			$args['offset'] = ( $page - 1 ) * $response['items_per_page'];
		}

		$results = get_terms( $args );

		foreach ( $results as $result ) {
			array_push(
				$response['items'],
				array(
					'id'   => $result->term_id,
					'text' => html_entity_decode( $result->name ),
				)
			);
		}

		wp_send_json_success( $response );
	}
}
