function detectIE() {
  var ua = window.navigator.userAgent;
  var msie = ua.indexOf('MSIE ');
  if (msie > 0) {
    // IE 10 or older => return version number
    return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
  }

  var trident = ua.indexOf('Trident/');
  if (trident > 0) {
    // IE 11 => return version number
    var rv = ua.indexOf('rv:');
    return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
  }

  var edge = ua.indexOf('Edge/');
  if (edge > 0) {
    // Edge (IE 12+) => return version number
    return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
  }

  // other browser
  return false;
}

var version = detectIE();
var largestHeight = 0;

// if (version === false) {
//   jQuery(window).on("scroll", function(){
//     var scroll = jQuery(this).scrollTop();
//     var heroHeight = jQuery('el').height() - 50;
//     var percent = scroll / heroHeight * 100;
//     var newPercent = (100 - percent) / 100;
//     jQuery('.slides').css({
//       'opacity' : newPercent,
//       'transform' : 'translateY('+ percent * 2.2 +'px)'
//     });
//   })
// }

jQuery(window).on("load", function(){

  jQuery('.thumbnail').each(function(){
    var imageHeight = jQuery(this).find('img').height();
    console.log(imageHeight);
    if(imageHeight > largestHeight){
      largestHeight = imageHeight
      console.log(largestHeight, imageHeight)
    }
    return largestHeight;
  })
  return largestHeight
})

jQuery(window).on("load resize", function(){
  jQuery('.thumbnail').height(largestHeight);
})

jQuery( document ).ready( function( $ ) {

  var int = $('.slides').data('time');
  var time = int * 1000;

  $(function(){
    $('.slide:gt(0)').hide();
    setInterval(function(){
      $('.slide:first-child').fadeOut()
         .next('.slide').fadeIn()
         .end().appendTo('.slides');},
      time);
    });

  $('#bag').on('click', function(){
    $('.bag').toggleClass('show');
  })
  $('.bag').on('click', '.bg', function(){
    $('.bag').removeClass('show');
  })

  // $(document).on('click', 'a', function(e){
  //   e.preventDefault();
  //   var url = $(this).attr("href");
  //
  //   console.log(url);
  //
  //   $.ajax({
  //      cache: false,
  //      type: 'POST',
  //      url: url,
  //      data: {
  //         'action': 'get_post'
  //      },
  //      dataType: 'JSON',
  //      success: function (response) {
  //        console.log(response);
  //      },
  //      error: function (XMLHttpRequest, status, error) {
  //        console.log(error);
  //      }
  //    });
  // })

  $('#categories-button').on('click', function(){
    $(this).siblings('.categories').toggleClass('show');
  })

  $('.product-link a').on('mouseover', function(){
    var title = $(this).data('title');
    $('.product-thumb').each(function(){
      if( $(this).data('title') == title ){
        $(this).addClass('hover');
      }
    })
  })
  $('.product-link a').on('mouseout', function(){
    var title = $(this).data('title');
    $('.product-thumb').each(function(){
      if( $(this).data('title') == title ){
        $(this).removeClass('hover');
      }
    })
  })

  $('.bag').on('click', '.remove-item', function(){
    var id = $(this).data('id');
    var url = $(this).data('url');
    var product = $(this).parent().parent();
    console.log(id);

    $.ajax({
       cache: false,
       type: 'POST',
       url: url,
       data: {
          'action': 'remove_cart_item',
          'product_id': id
       },
       dataType: 'JSON',
       success: function (response) {
         console.log(response);
         removeCartItemCallback(product, response);
       },
       error: function (XMLHttpRequest, status, error) {
         console.log(error);
       }
     });

     removeCartItemCallback = function(product, response){
       $('.cart-total').empty();
       $('.cart-total').append(response.total);
       product.hide();
     }

  })

  $('.add-to-cart').on('click .add-to-cart', function(e){

    var $btn = $(this);

    e.preventDefault();
    var request = $btn.data('url');
    var post_id = $btn.data('id');
    var quantity = $btn.siblings('.quantity-selector').find('.quantity').val();
    var url = request + '?add-to-cart=' + post_id + '&quantity=' + quantity;
    var thumbnail = $btn.parent().parent().find('.thumbnail');

    thumbnail.addClass('load');
    $btn.val('Adding to bag...');

    $.ajax({
     cache: false,
     type: 'GET',
     url: url,
     data: {
        'action': 'add_product_to_cart',
        'id': post_id,
        'quantity' : quantity
     },
     dataType: 'JSON',
     success: function (response) {
       addProductToCartCallback(response, $btn, thumbnail);
     },
     error: function (XMLHttpRequest, status, error) {
       console.log(error);
     }
   });

   addProductToCartCallback = function(response, $btn, thumbnail){
     $btn.val('Added to bag!');
     thumbnail.addClass('done');
     setTimeout(function(){
       $btn.val('Add to bag');
       thumbnail.removeClass('load');
       thumbnail.removeClass('done');
     }, 2000);

     $('.bag').empty();
     $('.bag').append(response.bag);

     console.log(response);

     return;

   }

  })

});
