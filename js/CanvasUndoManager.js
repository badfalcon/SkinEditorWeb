/**
 * Created by falcon on 2016/01/19.
 */

var maxIndex;
var editIndex;
var changeList;

$(function () {
    initUndo();
    $('#undo').click(function () {
        undo();
    });
    $('#redo').click(function () {
        redo();
    });
    $('#new').click(function () {
        newFile();
    });
    $('#load').click(function(){
        loadFile();
    });
    $('#save').click(function () {
        saveFile();
    });
});

function initUndo() {
    maxIndex = 0;
    editIndex = 0;
    changeList = [];
}

function undo() {
    if (undoable()) {
        console.log("undoable");
        editIndex -= 1;
        var ccdd = currentCanvasData.data;
        var change = changeList[editIndex];
        for (var i = 0; i < ccdd.length; i++) {
            ccdd[i] -= change[i];
        }
        context.putImageData(currentCanvasData, 0, 0);
        copyImage(main_canvas, current_canvas);
        copyImage(previous_canvas, current_canvas);
        updateSource();
    }
    console.log("maxIndex = " + maxIndex);
    console.log("editIndex = " + editIndex);
    console.log(changeList);

}

function undoable() {
    if (editIndex - 1 >= 0) {
        return true;
    } else {
        return false;
    }
}

function redo() {
    if (redoable()) {
        console.log("redoable");
        editIndex += 1;
        var ccdd = currentCanvasData.data;
        var change = changeList[editIndex - 1];
        for (var i = 0; i < ccdd.length; i++) {
            ccdd[i] += change[i];
        }
        context.putImageData(currentCanvasData, 0, 0);
        copyImage(main_canvas, current_canvas);
        copyImage(previous_canvas, current_canvas);
        updateSource();
    }
    console.log("maxIndex = " + maxIndex);
    console.log("editIndex = " + editIndex);
    console.log(changeList);
}

function redoable() {
    if (editIndex + 1 <= maxIndex) {
        return true;
    } else {
        return false;
    }
}

function newFile(){

}

function loadFile(){

}

function saveFile(){
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Great success! All the File APIs are supported.
        console.log("successfully saved this skin!!")
    } else {
        alert('The File APIs are not fully supported in this browser.');
    }
}