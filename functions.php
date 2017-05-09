<?php

if ( ! class_exists( 'Timber' ) ) {
	add_action( 'admin_notices', function() {
		echo '<div class="error"><p>Timber not activated. Make sure you activate the plugin in <a href="' . esc_url( admin_url( 'plugins.php#timber' ) ) . '">' . esc_url( admin_url( 'plugins.php') ) . '</a></p></div>';
	});

	add_filter('template_include', function($template) {
		return get_stylesheet_directory() . '/static/no-timber.html';
	});

	return;
}

Timber::$dirname = array('templates', 'views');

class TapeSite extends TimberSite {

	function __construct() {
		add_theme_support( 'post-formats' );
		add_theme_support( 'post-thumbnails' );
		add_theme_support( 'menus' );
		add_theme_support( 'html5', array( 'comment-list', 'comment-form', 'search-form', 'gallery', 'caption' ) );
		add_filter( 'timber_context', array( $this, 'add_to_context' ) );
		add_filter( 'get_twig', array( $this, 'add_to_twig' ) );
		add_action( 'init', array( $this, 'register_post_types' ) );
		add_action( 'init', array( $this, 'register_taxonomies' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'loadScripts' ) );
		add_action('wp_ajax_get_post', array( $this, 'ajax_get_post') );
		add_action('wp_ajax_nopriv_get_post', array( $this, 'ajax_get_post') );
		add_action( 'wp_ajax_add_product_to_cart', array( $this, 'prefix_ajax_add_product_to_cart' ) );
		add_action( 'wp_ajax_nopriv_add_product_to_cart', array( $this, 'prefix_ajax_add_product_to_cart' ) );
		add_action( 'wp_ajax_remove_cart_item', array( $this, 'prefix_ajax_remove_cart_item' ) );
		add_action( 'wp_ajax_page_link', array( $this, 'prefix_ajax_page_link' ) );
		add_action( 'wp_ajax_nopriv_remove_cart_item', array( $this, 'prefix_ajax_remove_cart_item' ) );
		if( function_exists('acf_add_options_page') ) {
			acf_add_options_page();
		}
		parent::__construct();
	}

	function loadScripts() {
				wp_register_script( 'siteJS', get_template_directory_uri() . '/static/site.js', array(), '1.0.0', true );
				wp_enqueue_script( 'siteJS');
	}


	function register_post_types() {
		//this is where you can register custom post types
	}

	function register_taxonomies() {
		//this is where you can register custom taxonomies
	}

	function add_to_context( $context ) {
		global $woocommerce;

		$context['menu'] = new TimberMenu();
		$context['site'] = $this;
		$context['logo'] = get_field('logo', 'options');
		$context['categories'] = Timber::get_terms('product_cat');
		return $context;
	}

	function add_to_twig( $twig ) {
				$twig->addExtension( new Twig_Extension_StringLoader() );

				function get_ajax_page() {
							return admin_url('admin-ajax.php', $_SERVER['SERVER_PORT'] == 443 ? 'https' : 'http');
				}

				function get_request(){
								$url=strtok($_SERVER["REQUEST_URI"],'?');
								echo $url;
				}

				return $twig;
	}

	function prefix_ajax_page_link(){

		$response = 'foo';

		echo json_encode($response);

		die();
	}

	function prefix_ajax_remove_cart_item(){

		$id = $_POST['product_id'];
		$cart_id = WC()->cart->generate_cart_id($id);

		$response = [
			'result' => WC()->cart->remove_cart_item($cart_id),
			'data' => '',
			'total' => get_cart_total(),
		];
		echo json_encode($response);
		die();
	}

	function prefix_ajax_add_product_to_cart() {

			$response = [
				'bag'		=> Timber::compile('bag.twig'),
				'data' => '',
				'total' => get_cart_total()
			];

			echo json_encode($response);

			die();
	}

}


function get_cart_total(){
		return WC()->cart->get_cart_total();
}


function get_cart_products(){
		$products = [];
		foreach(WC()->cart->get_cart() as $item => $values) {

					$id = $values['product_id'];

					$products[] = [
						"name"			=>	get_the_title($id),
						"thumbnail"	=>	get_the_post_thumbnail_url($id),
						"quantity" 	=> 	$values['quantity'],
						"id"				=>	$id,
						"price"			=>	get_post_meta($id, '_price', true)
					];
    }

		return $products;
}

new TapeSite();
