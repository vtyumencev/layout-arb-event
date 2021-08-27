let docWidth = 0;
const bgBorderWidth = 12;
const regularContainerWidth = 1140;
const minimizeWidth = 800;
const numberOfPoints = 5;

let p0 = {x:0,y:60},  // The first point on curve
    c0 = {x:420,y:100},   // Controller for p0
    c1 = {x:380,y:-60}, // Controller for p1
    p1 = {x:600,y:70};  // The last point on curve

$(function() {
    onPageSizeChange();

    $(document).scroll(function() {
        onPageSizeChange();
    });

    $('.mobile-menu-button').on('click', function (){
        $(this).toggleClass('active');
        $('.mobile-menu').toggleClass('active');
    });
    $('a[href^="#"]').on('click', function (e){
        e.preventDefault();
        $('.mobile-menu-button, .mobile-menu').removeClass('active');

        let targetID = $(this).attr('href').replace(/#/, '');
        let targetEl = $('#' + targetID);
        let targetScrollTop = targetEl.offset().top - $('.header-wrapper').outerHeight() - 10;

        $("html, body").animate({ scrollTop: targetScrollTop }, "slow");
    });


    // Слайд с вопросами
    $('.slide-questions__header').on('click', function (){
        let item = $(this).parents('.slide-questions__item');
        if(item.hasClass('active')) {
            hideQuestion(item);
        }
        else {
            showQuestion(item);
        }
    });

    $('.our-work__header-name').on('click', function (){
        let item = $(this).parents('.our-work__step');
        item.toggleClass('show');
    });

    // Форма
    $('.form__input-text, .form__textarea').on('focus', function () {
        $(this).parents('.form__field').addClass('active');
    }).on('blur', function () {
        $(this).parents('.form__field').removeClass('active');
        if($(this).val().length > 0) {
            $(this).parents('.form__field').addClass('is-filled');
        }
        else {
            $(this).parents('.form__field').removeClass('is-filled');
        }
    });
    $('.form__checkbox').on('change', function () {
        $(this).parents('.form__checkbox-container').toggleClass('active');
    });


    $('form').on('submit', function (e) {
        e.preventDefault();
        let formEl = $(this);

        let formData = $(this).serialize();

        $.ajax({
            type: "POST",
            url: "/ajax/digitale-form.php",
            data: formData,
            dataType: "json",
            success: function(data) {

            },
            error: function() {

            },
            complete: function () {
                $('#modal-1').modal('hide');
                $('#modal-info').modal('show');

                if(formEl.find('.form__mailigen-id').val() !== undefined) {
                    addMail(formEl.find('.form__mailigen-id').val(), formEl.find('.form__input-text-name').val(), formEl.find('.form__input-text-email').val());
                }
            }
        });
    });


    let options =  {
        translation: {
            'Z': {
                pattern: /[+]/, optional: true
            }
        },
        onKeyPress: function(cep, e, field, options) {
            if(cep.length === 1 && cep[0] === '9') {
                field.val('+7 (9');
            }
            else if(cep.length === 1 && cep[0] === '3') {
                field.val('+7 (3');
            }
            else if(cep.length === 1 && cep[0] === '7') {
                field.val('+7 (');
            }
            else if(cep.length === 1 && cep[0] !== '8') {
                field.val('');
            }
        }};
    $('input[type="tel"]').mask('Z0 (000) 000-00-00', options);

    $('#modal-1').on('show.bs.modal', function (e) {
        if($(e.relatedTarget).data('modal-title') !== undefined) {
            $('#modal-1 .modal-title').html($(e.relatedTarget).data('modal-title'));
        }
        if($(e.relatedTarget).data('modal-submit') !== undefined) {
            $('#modal-1 .form__submit').html($(e.relatedTarget).data('modal-submit'));
        }
        if($(e.relatedTarget).data('modal-id') !== undefined) {
            $('.form__id').val($(e.relatedTarget).data('modal-id'));
        }
        if($(e.relatedTarget).data('modal-mailigen-id') !== undefined) {
            $('.form__mailigen-id').val($(e.relatedTarget).data('modal-mailigen-id'));
        }
    });

    $('.scroll-up').on('click', function () {
        $("html, body").animate({ scrollTop: 0 }, "slow");
    });

    calcCanvasProps();
    drawLine();
    setMarkers();
    setupAtFirstPoint();

    updateExampleBackground();

    $(window).resize(function() {
        calcCanvasProps();
        drawLine();
        setMarkers();

        updateExampleBackground();

    });


    let svg = document.querySelector('.slide-our-work-container'),
        pointAt = document.getElementById('point-at'),
        pointAtWrapper = document.getElementById('point-at-wrapper');

    svg.onmousemove = function(e) {

        // Получение координаты X курсора
        let x = e.pageX - bgBorderWidth;

        // Вычисление ближайшей точки
        let absMinPoint = 0;
        let absMinDist = Number.MAX_SAFE_INTEGER;
        for (let i = 1; i <= numberOfPoints; i++) {
            let point = document.getElementById('point-' + i);
            let dist = Math.abs(point.getAttribute('cx') - x);

            if (dist < absMinDist) {
                absMinDist = dist;
                absMinPoint = i;
            }
        }

        let point = document.getElementById('point-' + absMinPoint);

        pointAt.setAttribute('cx', point.getAttribute('cx'));
        pointAt.setAttribute('cy', point.getAttribute('cy'));
        pointAtWrapper.setAttribute('cx', point.getAttribute('cx'));
        pointAtWrapper.setAttribute('cy', point.getAttribute('cy'));


        document.querySelectorAll('.our-work__step').forEach(function (item) {
            item.classList.remove('active');
        });

        let desc = document.getElementById('ow-step-' + absMinPoint);
        desc.classList.add('active');
    }

});

function onPageSizeChange() {
    $(".slide").each(function(i) {
        if($(this).hasClass('show') === false && ($(this).offset().top - $(document).scrollTop() - 300) < 0) {
            $(this).addClass('show');

            if($(this).hasClass('slide-analytics')) {

                const setTime = 2000;
                let time = setTime;
                let pieDraw = setInterval(function () {
                    let proc = time / setTime;

                    let x = Math.cos((Math.PI * 2 * proc)) * 100;
                    let y = Math.sin((Math.PI * 2 * proc)) * 100;

                    $('.analytics__pie-counter-num').html(Math.round((60 - time / setTime * 60) * 1.65));

                    if(proc > 0.5) {
                        $('#a-pie').attr('d', 'M0,0 L' + x + ',' + y + ' A100,100 0 0,1 100,0 Z');
                    }
                    else if(proc >= 0.4) {
                        $('#a-pie').attr('d', 'M0,0 L' + x + ',' + y + ' A100,100 0 1,1 100,0 Z');
                    }
                    else {
                        clearInterval(pieDraw);
                        $('.analytics__pie-counter-num').html(60);
                    }

                    time -= (10 - Math.pow((60 - time / setTime * 60), 3) / 5000);
                    if(time < 0) {
                        clearInterval(pieDraw);
                    }
                }, 10)
            }


            if($(this).hasClass('slide-questions')) {
                let item = $('.questions__content .slide-questions__item:first-child');
                showQuestion(item);
            }

        }
    });


    if($(document).scrollTop() > 50) {
        $('header').addClass('minimize');
    }
    else {
        $('header').removeClass('minimize');
    }
}

function calcCanvasProps() {
    docWidth = $(window).width() - bgBorderWidth * 2;
    document.getElementById('svg-work-line').style.width = docWidth + 'px';
    p1.x = docWidth;
}

function drawLine() {
    let path  =  document.getElementById('path'),
        ctrl1 =  document.getElementById('ctrl1'),
        ctrl2 =  document.getElementById('ctrl2'),
        D = 'M ' + p0.x + ' ' + p0.y +
            'C ' + c0.x + ' ' + c0.y +', ' + c1.x + ' ' + c1.y + ', ' + p1.x + ' ' + p1.y;

    path.setAttribute('d', D);
    ctrl1.setAttribute('d','M'+p0.x+','+p0.y+'L'+c0.x+','+c0.y);
    ctrl2.setAttribute('d','M'+p1.x+','+p1.y+'L'+c1.x+','+c1.y);

}

function setMarkers() {
    let workWidth = regularContainerWidth;
    let docMargin = 0;

    if(docWidth < regularContainerWidth) {
        workWidth = docWidth;
    }
    else {
        docMargin = (docWidth - regularContainerWidth) / 2;
    }


    if(workWidth <= minimizeWidth) {
        $('.our-work__step').removeAttr('style');
    }
    else {

        let step = workWidth / numberOfPoints;

        for(let i = 1; i <= numberOfPoints; i++) {

            let point = document.getElementById('point-' + i);

            let x = bgBorderWidth + 18 + docMargin + step * ( i - 1 );
            let p = YBX(p0, c0, c1, p1, x);
            point.setAttribute('cx', p.x);
            point.setAttribute('cy', p.y);

            let stepCard = document.getElementById('ow-step-' + i);
            stepCard.style.left = ( p.x - 5 ) + 'px';
            stepCard.style.bottom = (200 - p.y ) + 'px';

            stepCard.querySelector('.our-work__picture').style.bottom = (90 + p.y) + 'px';

            if(stepCard.offsetLeft + stepCard.querySelector('.our-work__picture').clientWidth > docWidth) {
                stepCard.querySelector('.our-work__description').style.right = 0 + 'px';
                stepCard.querySelector('.our-work__picture').style.right = 0 + 'px';
            }
            else {
                stepCard.querySelector('.our-work__description').style.removeProperty('right')
                stepCard.querySelector('.our-work__picture').style.removeProperty('right')
            }
        }


    }
}

function setupAtFirstPoint() {

    let point = document.getElementById('point-' + 1),
        pointAt = document.getElementById('point-at'),
        pointAtWrapper = document.getElementById('point-at-wrapper');

    pointAt.setAttribute('cx', point.getAttribute('cx'));
    pointAt.setAttribute('cy', point.getAttribute('cy'));
    pointAtWrapper.setAttribute('cx', point.getAttribute('cx'));
    pointAtWrapper.setAttribute('cy', point.getAttribute('cy'));

    let desc = document.getElementById('ow-step-' + 1);
    desc.classList.add('active');
}

function updateExampleBackground() {
    let s = $('.slide-example__slider').offset().left + $('.slide-example__slider').outerWidth() / 2;
    $('.slide-example .slide-background__colored').css('width', (docWidth + bgBorderWidth - s));
}

function showQuestion(item) {

    let itemHeader = item.find('.slide-questions__header-text');

    let itemReply = item.find('.slide-questions__reply');

    let itemReplyHeight = itemReply.outerHeight();
    let itemHeaderHeight = itemHeader.outerHeight();

    item.addClass('active').css('padding-bottom', 37 + itemReplyHeight + 'px');
    itemReply.css('top', itemHeaderHeight - 5);
}

function hideQuestion(item) {
    let itemReply = item.find('.slide-questions__reply');

    item.css('padding-bottom', 27 + 'px');
    item.removeClass('active');
    itemReply.css('top', 0 + 'px');
}

/**
 * 
 * @param idList
 * @param fname
 * @param email
 */

function addMail(idList, fname, email) {

    $.ajax({
        url: '/mgapi_add_email.php',
        method: 'POST',
        data: 'id=' + idList + '&email=' + email + '&fname=' + fname + '&double_optin=false',
        error: function(err) {console.log(err);  },
        success: function(data) {
            console.log(data);
        }
    });
}


/*
 * Get new x,y on curve by given x
 * @params a,b,c,d {x:x,y:y}
 * @params x
 * @return {{x:new x on cruve ,y: new y on cruve}}
 */
function YBX(a,b,c,d,x){

    a = a.x;
    b = b.x;
    c = c.x;
    d = d.x;

    // Lets expand this
    // x = a * (1-t)³ + b * 3 * (1-t)²t + c * 3 * (1-t)t² + d * t³
    //------------------------------------------------------------
    // x = a - 3at + 3at² - at³
    //       + 3bt - 6bt² + 3bt³
    //             + 3ct² - 3ct³
    //                    + dt³
    //--------------------------------
    // x = - at³  + 3bt³ - 3ct³ + dt³
    //     + 3at² - 6bt² + 3ct²
    //     - 3at + 3bt
    //     + a
    //--------------------------------
    // 0 = t³ (-a+3b-3c+d) +  => A
    //     t² (3a-6b+3c)   +  => B
    //     t  (-3a+3b)     +  => c
    //     a - x              => D
    //--------------------------------

    var A = d - 3*c + 3*b - a,
        B = 3*c - 6*b + 3*a,
        C = 3*b - 3*a,
        D = a-x;

    // So we need to solve At³ + Bt² + Ct + D = 0
    var t =  cubic(A,B,C,D);

    // Replace the t on Bezier function and get x,y
    var p = Bezier(p0,c0,c1,p1,t);

    return p;
}

/*
 * Bezier Function
 * Get X,Y by t
 * Refer to https://pomax.github.io/bezierinfo/
 * @params a,b,c,d {x:x,y:y}
 * @params t is between 0-1
 * @return {{x:x on curve ,y:y on curve}}
 */
function Bezier(a,b,c,d,t){
    var point = {x:0,y:0},
        mt  = 1-t,
        mt2 = mt*mt,
        mt3 = mt2*mt;

    //fx(t) = x1 * (1-t)³ + x2 * 3 * (1-t)²t + x3 * 3 * (1-t)t² + x4 * t³
    point.x = a.x*mt3 + b.x*3*mt2*t + c.x*3*mt*t*t + d.x*t*t*t;

    //fy(t) = y1 * (1-t)³ + y2 * 3 * (1-t)²t + y3 * 3 * (1-t)t² + y4 * t³
    point.y = a.y*mt3 + b.y*3*mt2*t + c.y*3*mt*t*t + d.y*t*t*t;

    return point;
}

/*
 * Cubic Equation Calculator
 * refer to http://www.1728.org/cubic.htm
 *
 * ax³ + bx² + cx + d = 0
 * @params a,b,c,d
 * @return x
 */

function cubic(a,b,c,d)
{
    var m,m2,k,n,n2,x,r,rc,theta,sign,dans;

    var f = eval(((3*c)/a) - (((b*b)/(a*a))))/3;
    var g = eval((2*((b*b*b)/(a*a*a))-(9*b*c/(a*a)) + ((27*(d/a)))))/27;
    var h = eval(((g*g)/4) + ((f*f*f)/27));

    if (h > 0) {

        m = eval(-(g/2)+ (Math.sqrt(h)));
        k = m < 0 ? -1:1;
        m2 = eval(Math.pow((m*k),(1/3)));
        m2 = m2*k;
        n = eval(-(g/2)- (Math.sqrt(h)));
        k = n<0 ? -1:1;
        n2 = eval(Math.pow((n*k),(1/3)));
        n2 = n2*k;
        x= eval ((m2 + n2) - (b/(3*a)));

    }else {
        r = (eval(Math.sqrt((g*g/4)-h)));
        k = r<0 ? -1:1;
        rc = Math.pow((r*k),(1/3))*k;
        theta = Math.acos((-g/(2*r)));
        x=eval (2*(rc*Math.cos(theta/3))-(b/(3*a)));
        x=x*1E+14;
        x=Math.round(x);
        x=(x/1E+14);
    }

    if ((f+g+h)==0)
    {
        if (d<0) {sign=-1}
        if (d>=0) {sign=1}
        if (sign>0){dans=Math.pow((d/a),(1/3));dans=dans*-1}
        if (sign<0){d=d*-1;dans=Math.pow((d/a),(1/3))}
        x=dans;
    }
    return x;
}