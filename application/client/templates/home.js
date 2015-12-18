Template.home.onRendered(function() {

  Session.set('isCloudConnecting', false);

  // Append .background-image-holder <img>'s as CSS backgrounds

  $('.background-image-holder').each(function() {
      var imgSrc = $(this).children('img').attr('src');
      $(this).css('background', 'url("' + imgSrc + '")');
      $(this).children('img').hide();
      $(this).css('background-position', '50% 50%');
  });
  
  // Fade in background images
  $('.background-image-holder').each(function() {
    $(this).addClass('fadeIn');
  });

/*
  videojs.autoSetup();

  videojs('main_video').ready(function(){
    console.log(this.options()); //log all of the default videojs options
    
     // Store the video object
    var myPlayer = this, id = myPlayer.id();
    // Make up an aspect ratio
    var aspectRatio = 387/580; 

    function resizeVideoJS(){
      var width = document.getElementById(id).parentElement.offsetWidth;
      myPlayer.width(width).height( width * aspectRatio );

    }
    
    // Initialize resizeVideoJS()
    resizeVideoJS();
    // Then on resize call resizeVideoJS()
    window.onresize = resizeVideoJS; 
  });
*/

});

Template.home.events({
  'mouseenter .pricing-option': function(e, t) {
    $('.pricing-option').removeClass('active');
    $(e.toElement).addClass('active');
  }
});
