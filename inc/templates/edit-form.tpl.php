<script type="text/html" id="tmpl-shortcode-default-edit-form">
	<form class="edit-shortcode-form">
		<p><a href="#" class="edit-shortcode-form-cancel">&#8592; <?php esc_html_e( 'Back to list', 'shortcode-ui' ); ?></a></p>

		<div class="edit-shortcode-form-fields shortcode-ui-edit-{{ data.model.attributes.shortcode_tag }}"></div>
	</form>
</script>

<script type="text/html" id="tmpl-tabbed-view-base">
    <div class="{{{ data.styles.group }}}" data-role="tab-group">
        <# _.each( data.tabs, function( tab, key ) { #>
            <a href="#" class="{{{ data.styles.tab }}}" data-role="tab" data-target="{{ key }}">{{ tab.label }}</a>
        <# }); #>
    </div>
    <div class="edit-shortcode-tabs-content" data-role="tab-content"></div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-text">
	<div class="field-block shortcode-ui-field-text shortcode-ui-attribute-{{ data.attr }}">
		<label for="{{ data.id }}">{{{ data.label }}}</label>
		<input type="text" class="regular-text" name="{{ data.attr }}" id="{{ data.id }}" value="{{ data.value }}" {{{ data.meta }}}/>
		<# if ( typeof data.description == 'string' && data.description.length ) { #>
			<p class="description">{{{ data.description }}}</p>
		<# } #>
	</div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-url">
	<div class="field-block shortcode-ui-field-url shortcode-ui-attribute-{{ data.attr }}">
		<label for="{{ data.id }}">{{{ data.label }}}</label>
		<input type="url" name="{{ data.attr }}" id="{{ data.id }}" value="{{ data.value }}" class="code {{data.class}}" {{{ data.meta }}}/>
		<# if ( typeof data.description == 'string' && data.description.length ) { #>
			<p class="description">{{{ data.description }}}</p>
		<# } #>
	</div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-textarea">
	<div class="field-block shortcode-ui-field-textarea shortcode-ui-attribute-{{ data.attr }}">
		<label for="{{ data.id }}">{{{ data.label }}}</label>
		<textarea name="{{ data.attr }}" id="{{ data.id }}" {{{ data.meta }}}>{{ data.value }}</textarea>
		<# if ( typeof data.description == 'string' && data.description.length ) { #>
			<p class="description">{{{ data.description }}}</p>
		<# } #>
	</div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-select">
	<div class="field-block shortcode-ui-field-select shortcode-ui-attribute-{{ data.attr }}">
		<label for="{{ data.id }}">{{{ data.label }}}</label>
		<select name="{{ data.attr }}" id="{{ data.id }}" {{{ data.meta }}}>
			<# _.each( data.options, function( option ) { #>

				<# if ( 'options' in option && 'label' in option ) { #>
					<optgroup label="{{ option.label }}">
						<# _.each( option.options, function( optgroupOption ) { #>
							<option value="{{ optgroupOption.value }}" <# if ( _.contains( _.isArray( data.value ) ? data.value : data.value.split(','), optgroupOption.value ) ) { print('selected'); } #>>{{ optgroupOption.label }}</option>
						<# }); #>
					</optgroup>
				<# } else { #>
					<option value="{{ option.value }}" <# if ( _.contains( _.isArray( data.value ) ? data.value : data.value.split(','), option.value ) ) { print('selected'); } #>>{{ option.label }}</option>
				<# } #>

			<# }); #>
		</select>
		<# if ( typeof data.description == 'string' && data.description.length ) { #>
			<p class="description">{{{ data.description }}}</p>
		<# } #>
	</div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-radio">
	<div class="field-block shortcode-ui-field-radio shortcode-ui-attribute-{{ data.attr }}">
		<label>{{{ data.label }}}</label>
		<# _.each( data.options, function( option ) { #>
			<label>
				<input type="radio" name="{{ data.attr }}" value="{{ option.value }}" <# if ( option.value == data.value ) { print('checked'); } #> />
				{{ option.label }}
			</label>
		<# }); #>
		<# if ( typeof data.description == 'string' && data.description.length ) { #>
			<p class="description">{{{ data.description }}}</p>
		<# } #>
	</div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-checkbox">
	<div class="field-block shortcode-ui-field-checkbox shortcode-ui-attribute-{{ data.attr }}">
		<label for="{{ data.id }}">
			<input type="checkbox" name="{{ data.attr }}" id="{{ data.id }}" value="{{ data.value }}" <# if ( 'true' == data.value ){ print('checked'); } #>>
			{{{ data.label }}}
		</label>
		<# if ( typeof data.description == 'string' && data.description.length ) { #>
			<p class="description">{{{ data.description }}}</p>
		<# } #>
	</div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-email">
	<div class="field-block shortcode-ui-field-email shortcode-ui-attribute-{{ data.attr }}">
		<label for="{{ data.id }}">{{{ data.label }}}</label>
		<input type="email" class="regular-text" name="{{ data.attr }}" id="{{ data.id }}" value="{{ data.value}}" {{{ data.meta }}}/>
		<# if ( typeof data.description == 'string' && data.description.length ) { #>
			<p class="description">{{{ data.description }}}</p>
		<# } #>
	</div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-number">
	<div class="field-block shortcode-ui-field-number shortcode-ui-attribute-{{ data.attr }}">
		<label for="{{ data.id }}">{{{ data.label }}}</label>
		<input type="number" class="regular-text" name="{{ data.attr }}" id="{{ data.id }}" value="{{ data.value}}" {{{ data.meta }}}/>
		<# if ( typeof data.description == 'string' && data.description.length ) { #>
			<p class="description">{{{ data.description }}}</p>
		<# } #>
	</div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-hidden">
	<div class="field-block shortcode-ui-field-hidden shortcode-ui-attribute-{{ data.attr }}">
		<label for="{{ data.id }}">{{{ data.label }}}</label>
		<input type="hidden" name="{{ data.attr }}" id="{{ data.id }}" value="true" {{{ data.meta }}}/>
		<# if ( typeof data.description == 'string' && data.description.length ) { #>
			<p class="description">{{{ data.description }}}</p>
		<# } #>
	</div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-date">
	<div class="field-block shortcode-ui-field-date shortcode-ui-attribute-{{ data.attr }}">
		<label for="{{ data.id }}">{{{ data.label }}}</label>
		<input type="date" name="{{ data.attr }}" id="{{ data.id }}" value="{{ data.value }}" {{{ data.meta }}}/>
		<# if ( typeof data.description == 'string' && data.description.length ) { #>
			<p class="description">{{{ data.description }}}</p>
		<# } #>
	</div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-content">
	<div class="field-block shortcode-ui-content shortcode-ui-attribute-{{ data.attr }}">
		<label for="inner_content">{{{ data.label }}}</label>
		<textarea id="inner_content" name="inner_content" class="content-edit" {{{ data.meta }}}>{{ data.value }}</textarea>
		<# if ( typeof data.description == 'string' && data.description.length ) { #>
			<p class="description">{{{ data.description }}}</p>
		<# } #>
	</div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-range">
	<div class="field-block shortcode-ui-field-range shortcode-ui-attribute-{{ data.attr }}">
		<label for="{{ data.id }}">{{{ data.label }}}</label>
		<div class="field-range-container">
			<input type="range" name="{{ data.attr }}" id="{{ data.id }}" value="{{ data.value}}" {{{ data.meta }}} />
			<output class="range" for="{{ data.id }}" id="{{ data.id }}_indicator">{{ data.value }}</output>
		</div>
		<# if ( typeof data.description == 'string' && data.description.length ) { #>
			<p class="description">{{{ data.description }}}</p>
		<# } #>
	</div>
</script>
