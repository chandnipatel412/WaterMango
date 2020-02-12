// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
var intervalID;
$(document).ready(function () {
    GetAll();
    $("#btnStop").attr("disabled", true);
    timeout = setTimeout(function () {
        CheckForWater();
    }, 1000);
    setInterval(function () { CheckForWater(); }, 60000);
});

$("#all").change(function () {
    if (this.checked) {
        $(".row-checkbox").prop('checked', true);
    }
    else {
        $(".row-checkbox").prop('checked', false);
    }
});

function rowcheckboxchanged() {
    if (!this.checked) {
        $("#all").prop('checked', false);
    }
}

function GetAll(selectedPlants = "", status = "") {
    $.ajax({
        url: "/WaterPlants/GetAll",
        type: "GET",
        contentType: "application/json; charset=utf-8",
        data: { ids: selectedPlants, status: status },
        dataType: "json",
        success: function (data) {
            var row = "";
            $.each(JSON.parse(data), function (index, item) {
                row += "<tr><td><input type='checkbox' class='custom-control-input row-checkbox' onchange='rowcheckboxchanged()' name='plantList' id='" + item.PlantId + "'></td><td id='plantName_" + item.PlantId + "'>" + item.PlantName + "</td><td id='status" + item.PlantId + "'>" + item.Status + "</td><td id='lastUpdated_" + item.PlantId + "' hidden>" + item.WateredLast + "</td></tr>";
            });
            $("#PlantDetails").html(row);
        },
        error: function (result) {
            alert("Error");
        }
    });
}

var timeout;
var selectedPlants;
$("#btnWater").click(function () {
    var needwater = NoNeedWater();
    if (!needwater) {
        selectedPlants = "";
        $.each($("input[name=plantList]:checked"), function () {
            var id = $(this).attr('id');
            $("#status" + id).html("Watering");
            selectedPlants = selectedPlants + "," + id;
        });
        selectedPlants = selectedPlants.slice(1);
        $("#btnStop").attr("disabled", false);
        $("#btnWater").attr("disabled", true);
        timeout = setTimeout(function () {
            GetAll(selectedPlants, "Watered");
            CheckForWater();
            $("#btnWater").attr("disabled", false);
            $("#btnStop").attr("disabled", true);
        }, 10000);
    }
});

$("#btnStop").click(function () {
    clearTimeout(timeout);
    var ids = selectedPlants.split(",");
    for (var i = 0; i < ids.length; i++) {
        $("#status" + ids[i]).html("NeedToWater");
    }
    $("#btnWater").attr("disabled", false);
    $("#btnStop").attr("disabled", true);
});

function CheckForWater() {
    var plants = "";
    
    var today = new Date();
    $.each($("input[name=plantList]"), function () {
        var id = $(this).attr('id');
        var wateredtime = $("#lastUpdated_" + id).html();
        if (wateredtime != null && wateredtime != "") {
            var lastwatered = new Date(wateredtime);
            var diff = Math.abs(today - lastwatered) / 36e5;
            if (diff > 6) {
                plants = plants + "," + $("#plantName_" + id).html();
            }
        }
    });
    if (plants != "") {
        $(".alert-warning").html("Please water following plants:" + plants.slice(1));
        $(".alert-warning").show();
    }
    else {
        $(".alert-warning").html("");
        $(".alert-warning").hide();
    }
}

function NoNeedWater() {
    debugger;
    var noneedwater = "";
    var today = new Date();
    $.each($("input[name=plantList]:checked"), function () {
        var id = $(this).attr('id');
        var wateredtime = $("#lastUpdated_" + id).html();
        if (wateredtime != null && wateredtime != "") {
            var lastwatered = new Date(wateredtime);
            debugger;
            var diffinSec = Math.abs(today - lastwatered) / 1000;
            if (diffinSec <= 30) {
                noneedwater = noneedwater + "," + $("#plantName_" + id).html();
            }
        }
    });
    if (noneedwater != "") {
        $(".alert-danger").html("The following plants are not needed to water: " + noneedwater.slice(1) + ". Please remove them from the selection. You just watered them.");
        $(".alert-danger").show();
        return true;
    }
    else {
        $(".alert-danger").html("");
        $(".alert-danger").hide();
        return false;
    }
}
