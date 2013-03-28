$(document).ready(function() {
    var gIndex = 0,
        gData,
        _px = 'px',
        gArray = [],
        gLoaded = [],
        EntriesLen = 0,
        scroll = $('.scroll'),
        flag = true;

    if($.cookie('index') != null)
        gIndex = Number($.cookie( 'index' ));

    function scroll_width(){
        scroll.css({
            "width": $(window).width() - 16 + _px
        });
    }

    function main_div_img( imgWidth, imgHeight ){
        var PrfNxtWidth = $('.main_img_next').width() + $('.main_img_pref').width(),
            nWidth  = $(window).width() - PrfNxtWidth,
            nHeight = $(window).height() - 80;

        if (imgWidth > nWidth) {
            imgHeight = Math.round( imgHeight * nWidth / imgWidth );
            imgWidth  = Math.round( nWidth );
        }
        if (imgHeight > nHeight) {
            imgWidth  = Math.round( imgWidth * nHeight / imgHeight );
            imgHeight = Math.round( nHeight );
        }
        $('.main_img').css(
            { "width":  imgWidth + _px,
                "height": imgHeight + _px });

        var div_width = imgWidth + PrfNxtWidth;
        $('.div_main_img').css(
            { "width":  div_width + _px,
                "height": imgHeight + _px,
                "margin-left": "-" + div_width / 2 + _px,
                "margin-top":  "-" + (23 + ( imgHeight/2 )) + _px });

        $('.main_img_pref div, .main_img_next div').css({
            "margin-top": (-43 + ( imgHeight/2 )) + _px });
    }

    function scrollTo() {
        scroll.stop();
        scroll.animate( { scrollLeft: gIndex * 89 - (scroll[0].clientWidth/2) + 44  }, 300 );
    }

    function changeImage( imIndex ) {
        $('#load_photo').css({display: "inline-block"});
        $('#selected').removeAttr('id');
        $('.album_imgs:eq('+ imIndex +')').attr('id', 'selected');

        var image = gData.entries[ imIndex ].img.XL;

        isFirstEnd( imIndex, EntriesLen - 1 );

        if(!gLoaded[ imIndex ]) {
            gArray [ imIndex ] = loadimg( image.href );
            gLoaded[ imIndex ] = true;
        }

        gArray[ imIndex ].done(function( wvalue, hvalue, src_img ) {
            main_div_img( wvalue, hvalue );

            $('.main_img').attr( 'src', src_img );
            $('#numPhoto').html( gIndex + 1 );
            $('.album_photo_title').text(gData.entries[ imIndex ].title);

            $('#load_photo').css({display: "none"});
            scrollTo();
            $.cookie('index', imIndex);

            if( imIndex < EntriesLen - 1 )
                if(flag){
                    gArray[ imIndex + 1] = loadimg( gData.entries[ imIndex + 1 ].img.XL.href );
                    flag = false;
                }
            if( imIndex < EntriesLen - 2 )
                gArray[ imIndex + 2] = loadimg( gData.entries[ imIndex + 2 ].img.XL.href );

        });
    }

    $.ajax({
        type: "GET",
        url: "http://api-fotki.yandex.ru/api/users/aig1001/album/63684/photos/",
        data: "format=json",
        dataType: "jsonp",
        success: function(data){
            gData = data;
            EntriesLen = gData.entries.length;
            scroll_width();
            main_success();
        }
    });

    function loadimg( src ) {
        var deferred = $.Deferred(),
            sprite = new Image();

        sprite.src = src;
        sprite.onload = function() {
            deferred.resolve(sprite.width, sprite.height, sprite.src);
        };
        return deferred.promise();
    }
    function isFirstEnd( index, last ){
        var main_img_pref = $('.main_img_pref'),
            main_img_next = $('.main_img_next'),
            main_img = $('.main_img');

        if( index ==0 && EntriesLen > 1 ){
            main_img_pref.css({display: "none"});
            main_img_next.css({display: "inline-block"});
            main_img.css({marginLeft: "50px", marginRight: "0", cursor: "pointer"});
        }
        else if( index == last && EntriesLen > 1 ){
            main_img_pref.css({display: "inline-block"});
            main_img_next.css({display: "none"});
            main_img.css({marginRight: "50px", marginLeft: "0", cursor: "default"});
        }
        else if( index == last && EntriesLen == 1 ){
            main_img_pref.css({display: "none"});
            main_img_next.css({display: "none"});
            main_img.css({marginRight: "50px", marginLeft: "50px", cursor: "default"});
        }
        else {
            main_img_pref.css({display: "inline-block"});
            main_img_next.css({display: "inline-block"});
            main_img.css({marginRight: "0", marginLeft: "0", cursor: "pointer"});
        }
    }

    function main_success(){
        console.log(gData);
        //выводим название альбома
        $('.album_title a').text('«' + gData.title + '»');
        $('.album_author a').html('<span style="color: red; border-bottom: 1px red solid">' + gData.author.slice(0, 1) + '</span>' + gData.author.slice(1));
        $('#numPhoto').html( gIndex + 1 );
        $('#allPhoto').html( EntriesLen );

        changeImage( gIndex );

        //выводим фотографии по 100 шт.
        var scroll = $('.scroll');
        for (var i = 0; i < EntriesLen; i++) {
            var src_img = gData.entries[i].img.XXS.href;
            if( i == gIndex )
                scroll.append('<img class="album_imgs" id="selected" src="'+ src_img +'">');
            else scroll.append('<img class="album_imgs" src="'+ src_img +'">');

        }
    }

    $(window).resize(function(){
        scroll_width();
        var img = gData.entries[ gIndex ].img.XL;
        main_div_img( img.width, img.height );
        scrollTo();
    });


    $('.main_img_next, .main_img').click(function(){
        if( gIndex < EntriesLen - 1 ){
            gIndex++;
            changeImage( gIndex );
        }
    })  .hover(function(){
            if( gIndex < EntriesLen - 1 )
                $(".main_img_next").css({
                    backgroundColor: "rgba(184, 184, 184, 0.11)"});
        }, function(){
            $(".main_img_next").css({
                backgroundColor: "transparent"});
        });

    var main_img_pref = $('.main_img_pref');
    main_img_pref.click(function(){
        gIndex--;
        changeImage(gIndex);

    })  .hover(function(){
            main_img_pref.css({ backgroundColor: "rgba(184, 184, 184, 0.11)" });
        }, function(){
            main_img_pref.css({ backgroundColor: "transparent" });
        });

    scroll.mousewheel(function( event, delta ){
        scroll.stop();
        this.scrollLeft -= (delta * 89);
    });

    var bottom = $('.bottom');
    bottom.hover(function(){
        bottom.stop();
        bottom.animate({marginBottom: "0"}, 300);

        $("#shadow").css({display: "inline-block"});

        $('.album_imgs').click(function(){
            gIndex = ($('.album_imgs').index(this));
            flag = true;

            changeImage( gIndex );

            $("#shadow").css({display: "none"});
        });
    } , function(){
        $("#shadow").css({display: "none"});
        bottom.stop()
            .animate({ marginBottom: -scroll.height() + _px }, 300);
    });
});