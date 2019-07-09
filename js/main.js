/**
 * Created by admin on 2015/12/01.
 */

var tool = 0;

var util_canvas, buffer_image, source_image, current_canvas, previous_canvas, main_canvas;

$(function () {
    util_canvas = $('<canvas>');
    buffer_image = $('img#buffer');
    source_image = $('img#source');
    current_canvas = $('canvas#current');
    previous_canvas = $('canvas#previous');
    main_canvas = $('canvas#main');

    disableSmoothing(main_canvas);
    disableSmoothing(current_canvas);
    disableSmoothing(previous_canvas);

    setCanvasDrawable(main_canvas);

    $('#new').on('click', onNew);
    $('#load').on('change', onRead);
    $('body').on('drop', onDrop);
    $('body').on('keydown', function (e) {
        onKeyDown(e);
    });

    $(buffer_image[0]).bind('load', onBufferLoad);

    $(source_image[0]).bind('load', onLoad);

    $(window).on('touchmove.noScroll', function (e) {
        e.preventDefault();
    });

    util_canvas.attr("width", "64px").attr("height", "64px");

    source_image.attr('src', util_canvas[0].toDataURL());
    buffer_image.attr('src', util_canvas[0].toDataURL());
    currentCanvasData = context.getImageData(0, 0, 64, 64);

    var timer = false;

    function onResize() {
        if (timer !== false) {
            clearTimeout(timer);
        }
        timer = setTimeout(function () {
            console.log('resized');
            // 何らかの処理
            var w = $(window).width() - 90 - ($(window).width() / 3);
            var h = $(window).height() - 54 - 37 - 5;
            if (w > h) {
                w = h;
            } else {
                h = w;
            }
            //$('#editor_space').css('width', 70 + w + "px");
            main_canvas.attr("width", w + "px");
            main_canvas.attr("height", h + "px");
            disableSmoothing(main_canvas);
            copyImage(main_canvas, current_canvas);
        }, 200);
    }

    $(window).resize(onResize);
    onResize();
});

function onKeyDown(e) {
    // ------------------------------------------------------------
    // 入力情報を取得
    // ------------------------------------------------------------
    // キーコード
    var key_code = e.keyCode;
    // Shiftキーの押下状態
    var shift_key = e.shiftKey;
    // Ctrlキーの押下状態
    var ctrl_key = e.ctrlKey;
    // Altキーの押下状態
    var alt_key = e.altKey;

    // ------------------------------------------------------------
    // 出力テスト
    // ------------------------------------------------------------
    console.log("code:" + key_code);
    console.log("shift:" + shift_key);
    console.log("ctrl" + ctrl_key);
    console.log("alt:" + alt_key);

    if ((key_code == 90) && ctrl_key) {
        undo();
    } else if ((key_code == 89) && ctrl_key) {
        redo();
    } else if ((key_code == 89) && ctrl_key) {
        copy();
    } else if ((key_code == 89) && ctrl_key) {
        cut();
    } else if ((key_code == 89) && ctrl_key) {
        paste();
    }
}

function disableSmoothing(target) {
    var $context = target[0].getContext('2d');
    $context.mozImageSmoothingEnabled = false;
    $context.msImageSmoothingEnabled = false;
    $context.imageSmoothingEnabled = false;
}

function onNew() {
    if (maxIndex > 0) {
        if (confirm('Do you want to load the image?')) {
            // Load it!
            clearCanvas(util_canvas);
            source_image.attr('src', util_canvas[0].toDataURL());
            initUndo();
        } else {
            // Do nothing!
        }
    } else {
        clearCanvas(util_canvas);
        source_image.attr('src', util_canvas[0].toDataURL());
        initUndo();
    }

}

function onDrop(e) {
    e.preventDefault();
    var file = e.originalEvent.dataTransfer.files[0];
    if (!file.type.match(/image\/\w+/)) {
        alert('画像ファイル以外は利用できません');
        return;
    } else {
        if (maxIndex > 0) {
            if (confirm('Do you want to load the image?')) {
                // Load it!
                loadImage(file);
            } else {
                // Do nothing!
            }
        } else {
            loadImage(file);
        }
    }
}

function onRead(e) {
    var file = e.target.files[0];
    if (!file.type.match(/image\/\w+/)) {
        alert('画像ファイル以外は利用できません');
        return;
    } else {
        if (maxIndex > 0) {
            if (confirm('Do you want to load the image?')) {
                // Load it!
                loadImage(file);
            } else {
                // Do nothing!
            }
        } else {
            loadImage(file);
        }
    }
}

function onBufferLoad(e) {
    var size = [this.naturalWidth, this.naturalHeight];
    console.log("buffer width:" + size[0] + ", height:" + size[1]);
    if (size[0] == 64) {
        console.log("width ok");

        if (size[1] == 32 || size[1] == 64) {
            console.log("height ok");

            var util_ctx = util_canvas[0].getContext('2d');
            util_ctx.clearRect(0, 0, 64, 64);
            if (size[1] == 32) {
                console.log("height : 32px");
                console.log("convert");
                util_ctx.drawImage(this, 0, 0, 64, 32);
                flipLimb(util_ctx, 0, 16, 16, 48);
                flipLimb(util_ctx, 40, 16, 32, 48);
            } else {
                console.log("height : 64px");
                util_ctx.drawImage(this, 0, 0, 64, 64);
            }
            source_image.attr('src', util_canvas[0].toDataURL());
            initUndo();
        } else {
            alert("unsupported size");
        }
    } else {
        alert("unsupported size");
    }
}

function flipLimb(ctx, sx, sy, dx, dy) {
    flipContext(ctx, sx + 0, sy + 4, 12, 12, dx + 0, dy + 4);
    flipContext(ctx, sx + 4, sy + 0, 4, 4, dx + 4, dy + 0);
    flipContext(ctx, sx + 8, sy + 0, 4, 4, dx + 8, dy + 0);
    flipContext(ctx, sx + 12, sy + 4, 4, 12, dx + 12, dy + 4);
}

function flipContext(ctx, sx, sy, w, h, dx, dy) {
    var input = ctx.getImageData(sx, sy, w, h);
    // Create output image data temporary buffer
    var output = ctx.createImageData(w, h);
    // Get imagedata size
    var inputData = input.data;
    var outputData = output.data;
    // loop
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            // RGB
            var i = (y * w + x) * 4;
            var flip = (y * w + (w - 1 - x)) * 4;
            for (var c = 0; c < 4; c++) {
                outputData[i + c] = inputData[flip + c];
            }
        }
    }
    ctx.putImageData(output, dx, dy);
}

function onLoad(e) {
    console.log("original loaded!!!");
    var main_context = main_canvas[0].getContext('2d');
    var source_context = current_canvas[0].getContext('2d');
    main_context.clearRect(0, 0, main_canvas.width, main_canvas.height);
    source_context.clearRect(0, 0, current_canvas.width, current_canvas.height);

    console.log(current_canvas[0]);
    console.log(source_image[0]);

    copyImage(current_canvas, source_image);
    copyImage(previous_canvas, source_image);
    copyImage(main_canvas, current_canvas);
    currentCanvasData = context.getImageData(0, 0, 64, 64);

    var c = current_canvas[0].toDataURL("image/png");

    console.log(c);
}


function loadImage(file) {
    // ブラウザごとの違いをフォローする
    window.URL = window.URL || window.webkitURL;

    // Blob URLの作成
    src = window.URL.createObjectURL(file);

    var reader = new FileReader();
    reader.onload = function () {
        buffer_image.attr('src', reader.result);
    };
    var image = reader.readAsDataURL(file);
}

function copyImage(target, image) {
    clearCanvas(target);
    console.log("image copied from " + image + " to " + target + ".");
    var context = target[0].getContext('2d');
    context.drawImage(image[0], 0, 0, target[0].width, target[0].height);
}

function clearCanvas(target) {
    var context = target[0].getContext('2d');
    context.clearRect(0, 0, target[0].width, target[0].height);
}