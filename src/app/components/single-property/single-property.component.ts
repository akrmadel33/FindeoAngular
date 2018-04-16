import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

import { Observable } from 'rxjs/Observable';

import { LanguageService } from '../../services/language.service';
import { ApiService } from '../../services/api.service';
import { CompareService } from '../../services/compare.service';

declare var google:any;
declare var ZoomControl:any;
declare var $:any;

@Component({
  selector: 'app-single-property',
  templateUrl: './single-property.component.html',
  styleUrls: ['./single-property.component.css']
})
export class SinglePropertyComponent implements OnInit,AfterViewInit {

  language:string;
  listingResults:any;
  featuredProperties = [];

  constructor(
    private route:ActivatedRoute,
    private languageService:LanguageService,
    private apiService:ApiService,
    private sanitizer:DomSanitizer,
    private compareService:CompareService) { }

  ngOnInit() {
    this.languageService.language$.subscribe( language => this.language = language );
    this.languageService.changeLanguage( this.route.snapshot.paramMap.get('lng') );

    //Get Single Property Data
    this.listingResults = this.apiService.api.singleProperty;

    //Get Featured Properties
    this.featuredProperties = this.apiService.api.featuredListings;
  }

  ngAfterViewInit() {
    this.inlineCSS();
    this.slickCarousel();
    this.accordion();
    this.owlCarousel();
    this.layoutSwitcher();
    this.eventListeners();

    this.initMap();
  }



  inlineCSS() {
    $(".property-slider .item").each(function() {
			var attrImageBG = $(this).attr('data-background-image');
			var attrColorBG = $(this).attr('data-background-color');

      if(attrImageBG !== undefined) {
        $(this).css('background-image', 'url('+attrImageBG+')');
      }

      if(attrColorBG !== undefined) {
        $(this).css('background', ''+attrColorBG+'');
      }
		});
  }
  slickCarousel() {
    $('.property-slider').slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: true,
      fade: true,
      asNavFor: '.property-slider-nav',
      centerMode: true,
      slide: ".item",
      adaptiveHeight: true
    });

    $('.property-slider-nav').slick({
      slidesToShow: 6,
      slidesToScroll: 1,
      asNavFor: '.property-slider',
      dots: false,
      arrows: false,
      centerMode: false,
      focusOnSelect: true,
      responsive: [
        {
          breakpoint: 993,
          settings: {
            slidesToShow: 4,
          }
        },
        {
          breakpoint: 767,
          settings: {
            slidesToShow: 3,
          }
        }
      ]
    });
  }
  accordion() {
    var $accor = $('.accordion');

    $accor.each(function() {
      $(this).toggleClass('ui-accordion ui-widget ui-helper-reset');
      $(this).find('h3').addClass('ui-accordion-header ui-helper-reset ui-state-default ui-accordion-icons ui-corner-all');
      $(this).find('div').addClass('ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom');
      $(this).find("div").hide();
    });

    var $trigger = $accor.find('h3');

    $trigger.on('click', function(e) {
      var location = $(this).parent();

      if( $(this).next().is(':hidden') ) {
        var $triggerloc = $('h3',location);
        $triggerloc.removeClass('ui-accordion-header-active ui-state-active ui-corner-top').next().slideUp(300);
        $triggerloc.find('span').removeClass('ui-accordion-icon-active');
        $(this).find('span').addClass('ui-accordion-icon-active');
        $(this).addClass('ui-accordion-header-active ui-state-active ui-corner-top').next().slideDown(300);
      }
      else if( $(this).is(':visible') ) {
        var $triggerloc = $('h3',location);
        $triggerloc.removeClass('ui-accordion-header-active ui-state-active ui-corner-top').next().slideUp(300);
        $triggerloc.find('span').removeClass('ui-accordion-icon-active');
      }
      e.preventDefault();
   });
  }
  owlCarousel() {
    $('.listing-carousel').owlCarousel({
      autoPlay: false,
      navigation: true,
      slideSpeed: 800,
      items : 1,
      itemsDesktop : [1239,1],
      itemsTablet : [991,1],
      itemsMobile : [767,1]
    });

    $('.owl-next, .owl-prev').on("click", function (e) {
      e.preventDefault();
    });
  }
  layoutSwitcher() {
    var listingsContainer = $('.listings-container');

		// switcher buttons / anchors
		if ( $(listingsContainer).is(".list-layout") ) {
			owlReload();
			$('.layout-switcher a.grid, .layout-switcher a.grid-three').removeClass("active");
			$('.layout-switcher a.list').addClass("active");
		}

		if ( $(listingsContainer).is(".grid-layout") ) {
			owlReload();
			$('.layout-switcher a.grid').addClass("active");
			$('.layout-switcher a.grid-three, .layout-switcher a.list').removeClass("active");
			gridClear(2);
		}

		if ( $(listingsContainer).is(".grid-layout-three") ) {
			owlReload();
			$('.layout-switcher a.grid, .layout-switcher a.list').removeClass("active");
			$('.layout-switcher a.grid-three').addClass("active");
			gridClear(3);
		}


		// grid cleaning
		function gridClear(gridColumns) {
			$(listingsContainer).find(".clearfix").remove();
			$(".listings-container > .listing-item:nth-child("+gridColumns+"n)").after("<div class='clearfix'></div>");
		}


		// objects that need to resized
		var resizeObjects =  $('.listings-container .listing-img-container img, .listings-container .listing-img-container');

		// if list layout is active
		function listLayout() {
			if ( $('.layout-switcher a').is(".list.active") ) {

				$(listingsContainer).each(function(){
					$(this).removeClass("grid-layout grid-layout-three");
					$(this).addClass("list-layout");
				});

				$('.listing-item').each(function(){
					var listingContent = $(this).find('.listing-content').height();
          $(this).find(resizeObjects).css('height', ''+listingContent+'');
        });

      }
		} listLayout();

		$(window).on('load resize', function() {
			listLayout();
		});


		// if grid layout is active
		$('.layout-switcher a.grid').on('click', function(e) { gridClear(2); });

		function gridLayout() {
			if ( $('.layout-switcher a').is(".grid.active") ) {

				$(listingsContainer).each(function(){
					$(this).removeClass("list-layout grid-layout-three");
					$(this).addClass("grid-layout");
				});

				$('.listing-item').each(function(){
          $(this).find(resizeObjects).css('height', 'auto');
				});

			}
		} gridLayout();


		// if grid layout is active
		$('.layout-switcher a.grid-three').on('click', function(e) { gridClear(3); });

		function gridThreeLayout() {
			if ( $('.layout-switcher a').is(".grid-three.active") ) {

				$(listingsContainer).each(function(){
					$(this).removeClass("list-layout grid-layout");
					$(this).addClass("grid-layout-three");
				});

				$('.listing-item').each(function(){
					$(this).find(resizeObjects).css('height', 'auto');
				});

			}
		} gridThreeLayout();


		// Mobile fixes
		$(window).on('resize', function() {
			$(resizeObjects).css('height', '0');
			listLayout();
			gridLayout();
			gridThreeLayout();
    });

    function helperLoadResize() {
      var winWidth = $(window).width();

			if(winWidth < 992) {
				owlReload();

				// reset to two columns grid
				gridClear(2);
			}

			if(winWidth > 992) {
				if ( $(listingsContainer).is(".grid-layout-three") ) {
					gridClear(3);
				}
				if ( $(listingsContainer).is(".grid-layout") ) {
					gridClear(2);
				}
			}

			if(winWidth < 768) {
				if ( $(listingsContainer).is(".list-layout") ) {
					$('.listing-item').each(function(){
						$(this).find(resizeObjects).css('height', 'auto');
					});
				}
			}

			// if(winWidth < 1366) {
			// 	if ( $(".fs-listings").is(".list-layout") ) {
			// 		$('.listing-item').each(function(){
			// 			$(this).find(resizeObjects).css('height', 'auto');
			// 		});
			// 	}
			// }
    } helperLoadResize();

		$(window).on('resize', function() {
			helperLoadResize();
		});


		// owlCarousel reload
		function owlReload() {
			$('.listing-carousel').each(function(){
				$(this).data('owlCarousel').reload();
			});
		}


	    // switcher buttons
		$('.layout-switcher a').on('click', function(e) {
      e.preventDefault();

      var switcherButton = $(this);
      switcherButton.addClass("active").siblings().removeClass('active');

		    // reset images height
			$(resizeObjects).css('height', '0');

		    // carousel reload
			owlReload();

		    // if grid layout is active
			gridLayout();

		    // if three columns grid layout is active
			gridThreeLayout();

			// if list layout is active
			listLayout();

    });
  }
  eventListeners() {
    /*----------------------------------------------------*/
    /*  Show More
    /*----------------------------------------------------*/
    $('.show-more-button').on('click', function(e){
    	e.preventDefault();
      $('.show-more').toggleClass('visible');
    });


    /*----------------------------------------------------*/
    /*  Mortgage Calculator
    /*----------------------------------------------------*/
    // Gets property price
    var propertyPricing:any = parseFloat($('.property-price').text().replace(/[^0-9\.]+/g,""));
    if (propertyPricing > 0) {
      $('.pick-price').on('click', function(){
        $('#amount').val( parseInt(propertyPricing) );
      });
    }
    // replacing comma with dot
    $(document).on('change', function() {
      $("#interest").val($("#interest").val().replace(/,/g, '.'));
    });


    /*----------------------------------------------------*/
    /*  Compare Menu
    /*----------------------------------------------------*/
    // Tooltips
    $(".compare-button.with-tip, .like-icon.with-tip, .widget-button.with-tip").each(function() {
      $(this).on('click', function(e){
          e.preventDefault();
      });
      var tipContent = $(this).attr('data-tip-content');
      $(this).append('<div class="tip-content">'+ tipContent + '</div>');
    });

    // Demo Purpose Trigger
    $('.compare-button, .compare-widget-button').on('click', function(){
      $('.compare-slide-menu').addClass('active');
    });

    $(".remove-from-compare").on('click', function(e){
        e.preventDefault();
    });


    /*----------------------------------------------------*/
    /*  Like Icon Trigger
    /*----------------------------------------------------*/
    $('.like-icon, .widget-button').on('click', function(e){
    	e.preventDefault();
      $(this).toggleClass('liked');
      $(this).children('.like-icon').toggleClass('liked');
    });

    /*----------------------------------------------------*/
    /*  Slide to anchor
    /*----------------------------------------------------*/
    $('#titlebar .listing-address').on('click', function(e){
	    e.preventDefault();
	    $('html, body').animate({
        scrollTop: $( $.attr(this, 'href') ).offset().top-40
	    }, 600);
    });
  }

  markerIcon = {
    path: 'M19.9,0c-0.2,0-1.6,0-1.8,0C8.8,0.6,1.4,8.2,1.4,17.8c0,1.4,0.2,3.1,0.5,4.2c-0.1-0.1,0.5,1.9,0.8,2.6c0.4,1,0.7,2.1,1.2,3 c2,3.6,6.2,9.7,14.6,18.5c0.2,0.2,0.4,0.5,0.6,0.7c0,0,0,0,0,0c0,0,0,0,0,0c0.2-0.2,0.4-0.5,0.6-0.7c8.4-8.7,12.5-14.8,14.6-18.5 c0.5-0.9,0.9-2,1.3-3c0.3-0.7,0.9-2.6,0.8-2.5c0.3-1.1,0.5-2.7,0.5-4.1C36.7,8.4,29.3,0.6,19.9,0z M2.2,22.9 C2.2,22.9,2.2,22.9,2.2,22.9C2.2,22.9,2.2,22.9,2.2,22.9C2.2,22.9,3,25.2,2.2,22.9z M19.1,26.8c-5.2,0-9.4-4.2-9.4-9.4 s4.2-9.4,9.4-9.4c5.2,0,9.4,4.2,9.4,9.4S24.3,26.8,19.1,26.8z M36,22.9C35.2,25.2,36,22.9,36,22.9C36,22.9,36,22.9,36,22.9 C36,22.9,36,22.9,36,22.9z M13.8,17.3a5.3,5.3 0 1,0 10.6,0a5.3,5.3 0 1,0 -10.6,0',
    strokeOpacity: 0,
    strokeWeight: 1,
    fillColor: '#274abb',
    fillOpacity: 1,
    rotation: 0,
    scale: 1,
    anchor: new google.maps.Point(19,50)
  }

  initMap() {
    var myLatLng = {lng: $( '#propertyMap' ).data('longitude'), lat: $( '#propertyMap' ).data('latitude'), };

    var single_map = new google.maps.Map(document.getElementById('propertyMap'), {
      zoom: 13,
      center: myLatLng,
      scrollwheel: false,
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: false,
      panControl: false,
      navigationControl: false,
      streetViewControl: false,
      styles:  [{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#747474"},{"lightness":"23"}]},{"featureType":"poi.attraction","elementType":"geometry.fill","stylers":[{"color":"#f38eb0"}]},{"featureType":"poi.government","elementType":"geometry.fill","stylers":[{"color":"#ced7db"}]},{"featureType":"poi.medical","elementType":"geometry.fill","stylers":[{"color":"#ffa5a8"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#c7e5c8"}]},{"featureType":"poi.place_of_worship","elementType":"geometry.fill","stylers":[{"color":"#d6cbc7"}]},{"featureType":"poi.school","elementType":"geometry.fill","stylers":[{"color":"#c4c9e8"}]},{"featureType":"poi.sports_complex","elementType":"geometry.fill","stylers":[{"color":"#b1eaf1"}]},{"featureType":"road","elementType":"geometry","stylers":[{"lightness":"100"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"},{"lightness":"100"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffd4a5"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#ffe9d2"}]},{"featureType":"road.local","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"weight":"3.00"}]},{"featureType":"road.local","elementType":"geometry.stroke","stylers":[{"weight":"0.30"}]},{"featureType":"road.local","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#747474"},{"lightness":"36"}]},{"featureType":"road.local","elementType":"labels.text.stroke","stylers":[{"color":"#e9e5dc"},{"lightness":"30"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"visibility":"on"},{"lightness":"100"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#d2e7f7"}]}]
    });

    var marker = new google.maps.Marker({
      position: myLatLng,
      map: single_map,
      icon: this.markerIcon
    });

    // Custom zoom buttons
    var zoomControlDiv:any = document.createElement('div');
    var zoomControl = new ZoomControl(zoomControlDiv, single_map);

    function ZoomControl(controlDiv, single_map) {
      zoomControlDiv.index = 1;
      single_map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(zoomControlDiv);
      // Creating divs & styles for custom zoom control
      controlDiv.style.padding = '5px';

      // Set CSS for the control wrapper
      var controlWrapper = document.createElement('div');
      controlDiv.appendChild(controlWrapper);

      // Set CSS for the zoomIn
      var zoomInButton = document.createElement('div');
      zoomInButton.className = "custom-zoom-in";
      controlWrapper.appendChild(zoomInButton);

      // Set CSS for the zoomOut
      var zoomOutButton = document.createElement('div');
      zoomOutButton.className = "custom-zoom-out";
      controlWrapper.appendChild(zoomOutButton);

      // Setup the click event listener - zoomIn
      google.maps.event.addDomListener(zoomInButton, 'click', function() {
        single_map.setZoom(single_map.getZoom() + 1);
      });

      // Setup the click event listener - zoomOut
      google.maps.event.addDomListener(zoomOutButton, 'click', function() {
        single_map.setZoom(single_map.getZoom() - 1);
      });
    }

    $('#streetView').click(function(e){
      e.preventDefault();
      single_map.getStreetView().setOptions({visible:true,position:myLatLng});
      $(this).css('display', 'none')
   });
  }


  mortgageCalc() {
    var amount = parseFloat($("#amount").val().replace(/[^0-9\.]+/g,"")),
		    months = parseFloat( $("#years").val().replace(/[^0-9\.]+/g,"").toString() ) * 12,
			  down = parseFloat($("#downpayment").val().replace(/[^0-9\.]+/g,"")),
			  annInterest = parseFloat($("#interest").val().replace(/[^0-9\.]+/g,"")),
			  monInt = annInterest / 1200,
			  calculation:any = ((monInt + monInt / (Math.pow(1 + monInt, months) - 1)) * (amount - (down || 0))).toFixed(2);

    if (calculation > 0 ){
      $(".calc-output-container").css({'opacity' : '1', 'max-height' : '200px' });
      $(".calc-output").hide().html(calculation + ' ' + $('.mortgageCalc').attr("data-calc-currency")).fadeIn(300);
    }
  }

  addProperty() {
    let property = {
      link: '/'+this.route.snapshot.paramMap.get('lng')+'/single-property/'+this.listingResults.id,
      state: this.listingResults.state,
      name: this.listingResults.name,
      price: this.listingResults.price,
      image: this.listingResults.images[0],
      area: this.listingResults.area,
      rooms: this.listingResults.rooms,
      bedrooms: this.listingResults.beds,
      bathrooms: this.listingResults.bathrooms,
      airConditioning: true,
      swimmingPool: true,
      laundryRoom: true,
      windoCovering: true,
      gym: true,
      internet: true,
      alarm: true,
      age: '---',
      heating: '---',
      parking: '---',
      sewer: '---'
    }

    this.compareService.addProperty(property);
  }

}