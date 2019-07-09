/**
 * Created by falcon on 2015/12/06.
 */
$(function () {
    var $tool = $('.tool_radio');

    $tool.click(function () {
        var toolNo = $(this).attr('id');
        toggleTool(parseInt(toolNo));
    });
});

function toggleTool(n) {
    console.log("tool toggled");
    tool = n;
}