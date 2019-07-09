/**
 * Created by falcon on 2015/12/17.
 */

var canvas;
var context;
var currentCanvasData;


var exitedPoint;

var color = [0, 0, 0, 255];
var eraser = [0, 0, 0, 0];


function setCanvasDrawable(dom) {

    canvas = dom;
    context = current_canvas[0].getContext('2d');
    currentCanvasData = context.getImageData(0, 0, 64, 64);

    dom.on('dragover', function (e) {
        e.preventDefault();
        onDragOver(e);
    });
    dom.on('mousedown touchstart', function (e) {
        e.preventDefault();
        pressed = true;
        onDown(e);
    });
    dom.on('mousemove touchmove', function (e) {
        e.preventDefault();
        onMove(e);
    });
    dom.on('mouseup touchend', function (e) {
        e.preventDefault();
        onUp(e);
    });
    dom.on('mouseenter', function (e) {
        e.preventDefault();
        onMouseEnter(e);
    });
    dom.on('mouseleave', function (e) {
        e.preventDefault();
        onMouseLeave(e);
    });

    dom.on('contextmenu', function (e) {
        return false;
    });
}


function onDragOver(e) {
    e.preventDefault();
    $(this).css('color', "gray");
}

var old;
var dot;

var pressed;

function onDown(e) {
    //console.log("DotX = " + dotX + " , DotY = " + dotY);

    var touch = false;
    if (isTouch(e)) {
        console.log("this is a touch event!!");
        touch = true;
        e = e.originalEvent.targetTouches[0];
    }

    old = getPressedDot(e);
    dot = old;
    console.log("onDown dot.x = " + dot.x + " , dot.y = " + dot.y);

    // buttons プロパティが利用可能である
    if (isLeftMouseButton(e) || touch) {

        switch (tool) {
            case 0:
                setPoint(old.x, old.y, color);
                break;
            case 1:
                setPoint(old.x, old.y, eraser);
                break;
            case 2:
                break;
            case 3:
                break;
            case 4:
                setPoint(old.x, old.y, color);
                break;
            case 5:
                setPoint(old.x, old.y, color);
                break;
            case 6:
                setPoint(old.x, old.y, color);
                break;
            case 7:
                break;
            case 8:
                setPoint(old.x, old.y, eraser);
                break;
        }
        context.putImageData(currentCanvasData, 0, 0);

        copyImage(main_canvas, current_canvas);
    }
}

function isTouch(e) {
    return (e.type == "touchstart" || e.type == "touchmove" || e.type == "touchend");
}

function getPressedDot(e) {
    var c = $(e.target);
    var pos = getMousePosition(e);
    var dotX = parseInt(pos.x / c.width() * 64);
    var dotY = parseInt(pos.y / c.height() * 64);
    return {x: dotX, y: dotY};
}

function getMousePosition(e) {
    var mouse = {x: null, y: null};
    var rect = e.target.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;

    return mouse;
}

function isLeftMouseButton(e) {
    if (!e) e = window.event; // レガシー

    // buttons プロパティが利用可能である
    if (e.button !== undefined) {

        var button = e.button;

        return (button === 0);
    }
    return false;
}

function onMove(e) {
    if (pressed) {
        if (isTouch(e)) {
            console.log("this is a touch event!!");
            e = e.originalEvent.targetTouches[0];
        }
        dot = getPressedDot(e);
        console.log("onMove dot.x = " + dot.x + " , dot.y = " + dot.y);
        switch (tool) {
            case 0:
                drawLine(old, dot, color);
                old = {x: dot.x, y: dot.y};
                break;
            case 1:
                drawLine(old, dot, eraser);
                old = {x: dot.x, y: dot.y};
                break;
            case 4:
                copyImage(current_canvas, previous_canvas);
                currentCanvasData = context.getImageData(0, 0, 64, 64);
                drawLine(old, dot, color);
                break;
            case 5:
                copyImage(current_canvas, previous_canvas);
                currentCanvasData = context.getImageData(0, 0, 64, 64);
                drawSquare(old, dot, color);
                break;
            case 6:
                copyImage(current_canvas, previous_canvas);
                currentCanvasData = context.getImageData(0, 0, 64, 64);
                fillSquare(old, dot, color);
                break;
            case 8:
                copyImage(current_canvas, previous_canvas);
                currentCanvasData = context.getImageData(0, 0, 64, 64);
                fillSquare(old, dot, eraser);
                break;
            default:
                console.log("tool = default");
                break;
        }
    }
}

function changeColor(picker) {
    color = [picker.rgb[0], picker.rgb[1], picker.rgb[2], 255];
}

function onUp(e) {
    //e.preventDefault();
    pressed = false;
    console.log("onUp dot.x = " + dot.x + " , dot.y = " + dot.y);
    console.log("tool = " + tool);
    switch (tool) {
        case 2:
            colorPick(dot);
            break;
        case 3:
            console.log(dot);
            scanLineFill(dot, getColor(dot));
            break;
    }
    saveEdit();
    copyImage(previous_canvas, current_canvas);
    updateSource();
    // }
}

function getColor(point) {
    var a = currentCanvasData.data;
    var p = (point.y * currentCanvasData.width + point.x) * 4;
    var c = [a[p], a[p + 1], a[p + 2], a[p + 3]];
    return c;
}

function colorPick(d) {
    var c = getColor(d);
    if (c[3] != 0) {
        color = [c[0], c[1], c[2], 255];
        $('#color')[0]
            .jscolor.fromRGB(c[0], c[1], c[2]);
    }
}

function saveEdit() {
    var changes = getChanges();
    if (editIndex == maxIndex) {
        editIndex++;
        maxIndex++;
    } else {
        changeList.splice(editIndex, maxIndex - editIndex);
        editIndex++;
        maxIndex = editIndex;
    }
    console.log("maxIndex = " + maxIndex);
    console.log("editIndex = " + editIndex);
    console.log(changeList);
    changeList.push(changes);
}

function getChanges() {
    var data0 = current_canvas[0].getContext('2d').getImageData(0, 0, 64, 64).data;
    var data1 = previous_canvas[0].getContext('2d').getImageData(0, 0, 64, 64).data;
    var changes = new Array(data0.length);
    for (var i = 0; i < data0.length; i++) {
        if (data0[i] != data1[i]) {
            changes[i] = data0[i] - data1[i];
        } else {
            changes[i] = 0;
        }
    }
    return changes;
}

function onMouseLeave(e) {
    onMove(e);
    console.log("mouseLeave");
    //e.preventDefault();
    if (pressed) {
        exitedPoint = e;
    }
    //pressed = false;
}

function onMouseEnter(e) {
    console.log("mouseEnter");
    if (!e) e = window.event; // レガシー

    // buttons プロパティが利用可能である
    if (pressed) {
        if (e.buttons !== undefined) {
            var data = e.buttons;
            var button_l = ((data & 0x0001) ? true : false);
            var button_r = ((data & 0x0002) ? true : false);
            var button_c = ((data & 0x0004) ? true : false);
            //console.log("マウス左ボタンの押下状態:" + button_l);
            //console.log("マウス右ボタンの押下状態:" + button_r);
            //console.log("マウス中央ボタンの押下状態:" + button_c);

            if (!(button_l || button_r || button_c)) {
                console.log("mouse leaved")
                onUp(exitedPoint);
            } else {
                switch (tool) {
                    case 1:
                        break;
                    case 0:
                        onDown(e);
                        break;


                }
            }

        }
    }

// ------------------------------------------------------------
// デフォルトの動作を無効化する
// ------------------------------------------------------------
    if (e.preventDefault) {
        // デフォルトの動作を無効化する
        e.preventDefault();
    } else {
        // デフォルトの動作を無効化する(非標準)
        return false;
    }
}

function scanLineFill(p, c) {
    //create new list buffer
    var buffer = [];
    //add p
    buffer.push(p);
    //while buffer size != 0
    while (buffer.length != 0) {
        var point = buffer[0];
        buffer.shift();

        if (getColor(point).toString() == color.toString()) {
            console.log("is same");
            continue;
        }

        var leftx = point.x;
        for (var i = point.x - 1; 0 <= i; i--) {
            if (getColor({x: i, y: point.y}).toString() == c.toString()) {
                leftx = i;
            } else {
                leftx = i + 1;
                break;
            }
        }

        var rightx = point.x;
        for (var i = point.x + 1; i <= 64 - 1; i++) {
            if (getColor({x: i, y: point.y}).toString() == c.toString()) {
                rightx = i;
            } else {
                rightx = i - 1;
                break;
            }
        }

        drawLine({x: leftx, y: point.y}, {x: rightx, y: point.y}, color)

        if (point.y + 1 < 64) {
            buffer = scanLine(leftx, rightx, point.y + 1, c, buffer);
        }
        if (0 <= point.y - 1) {
            buffer = scanLine(leftx, rightx, point.y - 1, c, buffer);
        }
    }

    function scanLine(leftx, rightx, y, c, buffer) {
        while (leftx <= rightx) {
            for (; leftx <= rightx; leftx++) {
                if (getColor({x: leftx, y: y}).toString() == c.toString()) {
                    break;
                }
            }
            if (rightx < leftx) {
                break;
            }

            for (; leftx <= rightx; leftx++) {
                if (getColor({x: leftx, y: y}).toString() != c.toString()) {
                    break;
                }
            }
            buffer.push({x: leftx - 1, y: y});
        }
        return buffer;
    }
}


function setPoint(x, y, c) {
    if (x >= 64) {
        x = 63;
    }
    if (x < 0) {
        x = 0;
    }
    if (y >= 64) {
        y = 63;
    }
    if (y < 0) {
        y = 0;
    }
    //var currentCanvasData = context.getImageData(0, 0, 64, 64);
    var a = currentCanvasData.data;
    var p = (y * currentCanvasData.width + x) * 4;
    a[p + 0] = c[0];
    a[p + 1] = c[1];
    a[p + 2] = c[2];
    a[p + 3] = c[3];
    //updateSource();
}
function drawSquare(p1, p2, c) {
    var a = new Object();
    var b = new Object();
    if (p1.x > p2.x) {
        a["x"] = p2.x;
        b["x"] = p1.x;
    } else {
        a["x"] = p1.x;
        b["x"] = p2.x;
    }
    if (p1.y > p2.y) {
        a["y"] = p2.y;
        b["y"] = p1.y;
    } else {
        a["y"] = p1.y;
        b["y"] = p2.y;
    }
    for (var i = a.y; i <= b.y; i++) {
        for (var j = a.x; j <= b.x; j++) {
            if (i == a.y || i == b.y || j == a.x || j == b.x) {
                setPoint(j, i, c);
            }
        }
    }
    context.putImageData(currentCanvasData, 0, 0);

    copyImage(main_canvas, current_canvas);
}

function fillSquare(p1, p2, c) {
    var a = new Object();
    var b = new Object();
    if (p1.x > p2.x) {
        a["x"] = p2.x;
        b["x"] = p1.x;
    } else {
        a["x"] = p1.x;
        b["x"] = p2.x;
    }
    if (p1.y > p2.y) {
        a["y"] = p2.y;
        b["y"] = p1.y;
    } else {
        a["y"] = p1.y;
        b["y"] = p2.y;
    }
    for (var i = a.y; i <= b.y; i++) {
        for (var j = a.x; j <= b.x; j++) {
            setPoint(j, i, c);
        }
    }
    context.putImageData(currentCanvasData, 0, 0);

    copyImage(main_canvas, current_canvas);

}

function drawLine(p1, p2, c) {
    setPoint(x, y, c);

    if ((p2.x - p1.x) == 0 || Math.abs((p2.y - p1.y) / (p2.x - p1.x)) >= 1) {
        if (p2.y - p1.y == 0) {
            setPoint(p1.x, p1.y, c);
        } else {
            if (p1.y > p2.y) {
                var temp = {x: p1.x, y: p1.y};
                p1 = {x: p2.x, y: p2.y};
                p2 = {x: temp.x, y: temp.y};
            }
            for (var y = p1.y; y <= p2.y; y++) {
                var x = (p2.x - p1.x) * (y - p1.y) / (p2.y - p1.y) + p1.x;
                if (isInside(x, y)) {
                    setPoint(parseInt(x), parseInt(y), c);
                }
            }
        }
    } else {
        if (p1.x > p2.x) {
            var temp = {x: p1.x, y: p1.y};
            p1 = {x: p2.x, y: p2.y};
            p2 = {x: temp.x, y: temp.y};
        }
        for (var x = p1.x; x <= p2.x; x++) {
            var y = (p2.y - p1.y) * (x - p1.x) / (p2.x - p1.x) + p1.y;
            if (isInside(x, y)) {

                setPoint(parseInt(x), parseInt(y), c);
            }
        }
    }

    //context.putImageData(imageData, 0, 0);

    //updateSource();
    context.putImageData(currentCanvasData, 0, 0);

    copyImage(main_canvas, current_canvas);
}

function isInside(x, y) {
    return !!(0 <= x && x < 64 && 0 <= y && y < 64);
}

function updateSource() {
    var $canvas = $('canvas#current');
    var base64Data = $canvas[0].toDataURL("image/png");
    //source_image.attr("src", base64Data);
    $('#save').find('> a').attr('href', base64Data);
}