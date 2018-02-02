

var app = angular.module("mySimpleWalletDapp");

var initRecordType = function(callbackListener) {
    //var serviceIconcArray = {1: "icon_service.png", 2: "icon_milage.png", 3: "icon_accident.png"};
    $('#milage_id').bind("DOMSubtreeModified",function(){
        if ($('#milage_id').text().length === 0) {
            return;
        }
        callbackListener($('#milage_id').text().toLowerCase());
    });
}

var getKeyByValue = function(obj, value) {
    for( var prop in obj ) {
        if( obj.hasOwnProperty( prop ) ) {
             if( obj[ prop ] === value )
                 return prop;
        }
    }
}

var getRecType = function() {
    var nam = $('#milage_id').text().toLowerCase();
    var vall = "icon_" + nam + ".png";
    return getKeyByValue(serviceIconcArray, vall);
}

var initSanpVin = function(checkCallback) {
    $("#snap_vin_searh").show();
    $("#snap_vin_show").hide();
    $("#snap_vin_show_button").click(function() {
        if ($('#form316222').val().length === 0) {
            return;
        }
        checkCallback();
    })
}

var currentDateString = function() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!

    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd;
    } 
    if(mm<10){
        mm='0'+mm;
    } 
    var today = dd+'/'+mm+'/'+yyyy;
    return today;
}

var setStatus = function(clear) {
    if (clear) {
        $("#date_field").val(currentDateString())
        $(".datepicker").datepicker();
        $("#form316222").val('')
        $("#form325162").val('0')
        $("#form386162").val('')

        $("#snap_vin_searh").show();
        $("#snap_vin_show").hide();

        $("#drop_fff").attr("disabled", "disabled");
        $("#date_field").attr("disabled", "disabled");
        $("#add_record").attr("disabled", "disabled");
        $("#form325162").attr("disabled", "disabled");
        $("#form386162").attr("disabled", "disabled");
    } else {
        $("#snap_vin_searh").hide();
        $("#snap_vin_show").show();

        $("#drop_fff").removeAttr("disabled");
        $("#date_field").removeAttr("disabled");
        $("#add_record").removeAttr("disabled");
        $("#form325162").removeAttr("disabled");
        $("#form386162").removeAttr("disabled");
    }
}

app.controller("ContractorsController", function ($scope) {

    $('.drop-menu > a').on( "click", function() {
        var LinkThis = $(this).parent();
        if (LinkThis.find('span').hasClass('slide')) {
            LinkThis.find('span').removeClass('slide');
        }else {
            $('.link span').removeClass('slide');
            LinkThis.find('span').addClass('slide');
        }
        
        return false;
    });
                 
    $('.drop').on( "click", function() {
            if (!$('#drop_fff').attr('disabled')) {
                if($('.drop-list').hasClass('act')){
                    $(this).find('.drop-list').removeClass('act');
                    $(this).find('span').slideUp(300);
                }else{
                   $('.drop span').slideUp(300);
                    $(this).find('.drop-list').addClass('act');
                    
                    $(this).find('span').slideDown(300);
                }
                return false;
            }
        });
        
    $('.drop span a').on( "click", function() {
            $(this).parent().parent().find('b').text($(this).text());
            $('.drop').find('span').slideUp(300);
    });    

    Vin.init(function(contract) {

        initRecordType(function(val) {
            //alert(val);
            $("#rec_type_img").attr('src','img/icon_'+val+'.png');
        });

        initSanpVin(function() {
            $("#LoadModal").show();
            var vin = $('#form316222').val();

            contract.getVinDataSize(vin).then(function(result) {
                console.log(result);
                var carTyp = result[0].toNumber();
                if (carTyp != 0) {
                    carsMapping[vin] = carsArray[carTyp];
                    $("#addRecord_carType").val(carTyp);
                }
                if (!(vin in carsMapping)) {
                    var randomNumberBetween1and17 = Math.floor(Math.random() * 16) + 1;
                    carsMapping[vin] = carsArray[randomNumberBetween1and17];
                    $("#addRecord_carType").val(randomNumberBetween1and17);
                }
                $("#snap_vin_name").text(carsMapping[vin]);
                $("#snap_vin_vin").text("VIN: " + vin);
                $("#addRecord_vin").val(vin);
                setStatus(false);
                
                $("#LoadModal").hide();

            }).catch(function(error) {
                console.error(error);
                $scope.error = error.message;
                showErrorDialog("Get VIN data size error!");
                $("#LoadModal").hide();
            });
        });

        setStatus(true);

        if (Vin.web3.eth.accounts.length == 0) {
            $("#search-block__btn").attr("disabled", "disabled");
        } else {
            $("#search-block__btn").removeAttr("disabled");  
            contract.isAllowedAddressToContract(Vin.web3.eth.accounts[0]).then(function(allow) {
                if (allow) {
                    $("#a_contract").show();
                } else {
                    $("#a_contract").hide();
                }
            }).catch(function(error) {
                console.error(error);
            });

            contract.getOwner().then(function(address) {
                if (address == Vin.web3.eth.accounts[0]) {
                    $("#a_managment").show();
                } else {
                    $("#a_managment").hide();
                }
            }).catch(function(error) {
                console.error(error);
            });         
        }

        $scope.addRecord = function(vin, carType, date, milage, comment) {
            console.log(vin);
            var carType = $("#addRecord_carType").val();
            var recType = getRecType()
            console.log(recType);

            $("#LoadModal").show(); 

            if (date == undefined) {
                date = currentDateString();
            }
            if (milage == undefined) {
                milage = 0;
            }
            if (comment == undefined) {
                comment = "";
            }

            var unixTimeZero = Date.parse(date) / 1000;

            //string vin, uint carType, uint recordType, uint date, uint milage, string comment
            contract.addRecord(vin, carType, recType, unixTimeZero, milage, comment).then(function() {
                setStatus(true);
                $("#LoadModal").hide();

            }).catch(function(error) {
                console.error(error);
                $scope.error = error.message;
                showErrorDialog("Add record error!");
                $("#LoadModal").hide();
            });
        }

    });


});