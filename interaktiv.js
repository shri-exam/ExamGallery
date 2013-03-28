$(document).ready(function() {
    var gIndex = 0,                 //индекс текущей картинки
        gData,                      //информация полученная с сервера
        _px = 'px',
        gArray = [],                //массив Deferred обьектов (картинок)
        gLoaded = [],               //массив загруженный картинок true/false
        EntriesLen = 0,             //длина массива изображений
        scroll = $('.scroll'),
        flag = true;                //вкл./выкл. загрузки gIndex+1 изображения

    if($.cookie('index') != null)
        gIndex = Number($.cookie( 'index' ));

    /*____________________________________________/ длина видимого скролла \__________________________________________*/
    function scroll_width(){
        scroll.css({
            "width": $(window).width() - 16 + _px
        });
    }

    /*____________________________________________/ отцентрирование, ужатие главной картинки \________________________*/
    function main_div_img( imgWidth, imgHeight ){
        var PrfNxtWidth = $('.main_img_next').width() + $('.main_img_pref').width(),
            nWidth  = $(window).width() - PrfNxtWidth,
            nHeight = $(window).height() - 80;

        //пропорции
        if (imgWidth > nWidth) {
            imgHeight = Math.round( imgHeight * nWidth / imgWidth );
            imgWidth  = Math.round( nWidth );
        }
        if (imgHeight > nHeight) {
            imgWidth  = Math.round( imgWidth * nHeight / imgHeight );
            imgHeight = Math.round( nHeight );
        }

        //меняем размер картинки
        $('.main_img').css(
            { "width":  imgWidth + _px,
              "height": imgHeight + _px });

        //меняем размер блока всего
        var div_width = imgWidth + PrfNxtWidth;
        $('.div_main_img').css(
            { "width":  div_width + _px,
              "height": imgHeight + _px,
              "margin-left": "-" + div_width / 2 + _px,
              "margin-top":  "-" + (23 + ( imgHeight/2 )) + _px });

        //отцентрирование стрелок перелистывания
        $('.main_img_pref div, .main_img_next div').css({
              "margin-top": (-42 + ( Math.round(imgHeight/2) )) + _px });
    }

    /*____________________________________________/ прокрутка до #selected + (фисирование его по цетру) \_____________*/
    function scrollTo() {
        scroll.stop();
        scroll.animate( { scrollLeft: gIndex * 89 - (scroll[0].clientWidth/2) + 44  }, 300 );
    }

    /*____________________________________________/ Замена главной картинки \_________________________________________*/
    function changeImage( imIndex ) {

        //вывод блока "Загрузка..."
        $('#load_photo').css({display: "inline-block"});
        //переназначаем выделенное фото в сролле
        $('#selected').removeAttr('id');
        $('.album_imgs:eq('+ imIndex +')').attr('id', 'selected');

        //обькт — большая картинка
        var image = gData.entries[ imIndex ].img.XL;

        //определяем направление перелистывания
        isFirstEnd( imIndex, EntriesLen - 1 );

        //если картинка не загружена, то загружаем
        if(!gLoaded[ imIndex ]) {
            gArray [ imIndex ] = loadimg( image.href );
            gLoaded[ imIndex ] = true;
        }

        //успешная загрузка картинки
        gArray[ imIndex ].done(function( wvalue, hvalue, src_img ) {
            //успешная загрузка отцентрирование
            main_div_img( wvalue, hvalue );

            //вывод изображения + информации
            $('.main_img').attr( 'src', src_img );
            $('#numPhoto').html( gIndex + 1 );
            $('.album_photo_title').text(gData.entries[ imIndex ].title);

            //скрываем блок "Загрузка..."
            $('#load_photo').css({display: "none"});
            //крутим скролл
            scrollTo();
            //записываем индекс в куки
            $.cookie('index', imIndex);

            //предзагрузка наперед 2х картинок
            if( imIndex < EntriesLen - 1 && !gLoaded[ imIndex + 1 ])
                if(flag){
                    gArray[ imIndex + 1] = loadimg( gData.entries[ imIndex + 1 ].img.XL.href );
                    flag = false;
                }
            if( imIndex < EntriesLen - 2 && !gLoaded[ imIndex + 2 ])
                gArray[ imIndex + 2] = loadimg( gData.entries[ imIndex + 2 ].img.XL.href );

        });
    }

    /*____________________________________________/ Запрос на сервер \________________________________________________*/
    $.ajax({
        type: "GET",
        url: "http://api-fotki.yandex.ru/api/users/aig1001/album/63684/photos/",
        data: "format=json",
        dataType: "jsonp",
        success: function(data){
            gData = data;
            EntriesLen = gData.entries.length;
            scroll_width();
            main_div_img( 0, 0 );
            main_success();
        }
    });

    /*____________________________________________/ Функция загрузки изображения \____________________________________*/
    function loadimg( src ) {
        var deferred = $.Deferred(),
            sprite = new Image();

        sprite.src = src;
        sprite.onload = function() {
            deferred.resolve(sprite.width, sprite.height, sprite.src);
        };
        return deferred.promise();
    }

    /*____________________________________________/ видимость стрелок перелистывания \________________________________*/
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

    /*____________________________________________/ инициирующая функция \____________________________________________*/
    function main_success(){

        //вывод информации (заголовок, автор, количество фотографий)
        $('.album_title a').text('«' + gData.title + '»');
        $('.album_author a').html('<span style="color: red; border-bottom: 1px red solid">' + gData.author.slice(0, 1) + '</span>' + gData.author.slice(1));
        $('#numPhoto').html( gIndex + 1 );
        $('#allPhoto').html( EntriesLen );

        //меняем главную картинку
        changeImage( gIndex );

        //выводим фотографии в скролл
        var scroll = $('.scroll');
        for (var i = 0; i < EntriesLen; i++) {
            var src_img = gData.entries[i].img.XXS.href;
            if( i == gIndex )
                scroll.append('<img class="album_imgs" id="selected" src="'+ src_img +'">');
            else scroll.append('<img class="album_imgs" src="'+ src_img +'">');

        }
    }

    /*____________________________________________/ при resize окна  \________________________________________________*/
    $(window).resize(function(){
        scroll_width();
        var img = gData.entries[ gIndex ].img.XL;
        main_div_img( img.width, img.height );
        scrollTo();
    });

    /*____________________________________________/ следующая картика \_______________________________________________*/
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

    /*____________________________________________/ предыдущая картика \______________________________________________*/
    var main_img_pref = $('.main_img_pref');
    main_img_pref.click(function(){
        gIndex--;
        changeImage(gIndex);

    })  .hover(function(){
            main_img_pref.css({ backgroundColor: "rgba(184, 184, 184, 0.11)" });
        }, function(){
            main_img_pref.css({ backgroundColor: "transparent" });
        });

    /*____________________________________________/ прокрутка скролла колесиком мыши \_________________________________*/
    scroll.mousewheel(function( event, delta ){
        scroll.stop();
        this.scrollLeft -= (delta * 89);
    });

    /*____________________________________________/ наведении курсора на галерею картинок \___________________________*/
    var bottom = $('.bottom');
    bottom.hover(function(){
        bottom.stop();
        bottom.animate({marginBottom: "0"}, 300);

        //показываем блок глобальной тени
        $("#shadow").css({display: "inline-block"});

        $('.album_imgs').click(function(){
            gIndex = ($('.album_imgs').index(this));

            //включам загрузку gIndex+1 изображения
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