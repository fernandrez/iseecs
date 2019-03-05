$(document).ready(function() {
  var firstButton = '<li class="google-page-first""><a class="google-page-button" data-page="1" href="#"><<</a></li>';
  var prevButton = '<li class="google-page-prev"><a class="google-page-button" data-page="1" href="#"><</a></li>';
  var page = 1;
  $("#google-news").on('click','.google-page-button',(event)=>{
    var p = $(event.target).data('page');
    if(page != p){
      page = p;
      $(".google-page").fadeOut(250).promise().done(() => {$(".google-page-"+p+"").fadeIn(250);});
      $(".google-page-prev a").data('page', Math.max(p-1,1));
      $(".google-page-number").html(p);
      $(".google-page-next a").data('page', Math.min(p+1,3));
      if(p==1){$(".google-page-prev").remove();}
      if(p==2){if($(".google-page-prev").length == 0)$(prevButton).prependTo('.google-page-buttons');}
      if(p==3){if($(".google-page-first").length == 0)$(firstButton).prependTo('.google-page-buttons');}
      else{$(".google-page-first").remove();}
    }
    event.preventDefault();
  });
  $.ajax({
      url: '/a/google/news',
      cache: false,
      timeout: 5000,
      success: function(data) {
          $("#google-news-placeholder").hide(0, ()=>{
            $("#google-news").html(data).fadeIn(1000);
          });
      },
      error: function(jqXHR, textStatus, errorThrown) {
          alert('error ' + textStatus + " " + errorThrown);
      }
  });
});
