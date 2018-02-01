

var app = angular.module("mySimpleWalletDapp");

var initRecordType = function(callbackListener) {
    //var serviceIconcArray = {1: "icon_service.png", 2: "icon_milage.png", 3: "icon_accident.png"};
    $('#access_id').bind("DOMSubtreeModified",function(){
        if ($('#access_id').text().length === 0) {
            return;
        }
        callbackListener($('#access_id').text().toLowerCase());
    });
}

var getAllowType = function() {
    return $('#access_id').text().toLowerCase();
}

app.controller("ManagementController", function ($scope) {

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
            if (!$('.drop').prop('disabled')) {
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
        });

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

        $("#form31622adr2").val('')

        $scope.changePermission = function(address, allowDisallow) {
            console.log(address);
            $("#LoadModal").show();

            var allowType = getAllowType();


            if(allowType == 'allow') {
                contract.allowAddressToContract(address, {from: Vin.web3.eth.accounts[0]}).then(function() {
                    $("#form31622adr2").val('')
                    $("#LoadModal").hide();

                }).catch(function(error) {
                    console.error(error);
                    $scope.error = error.message;
                    showErrorDialog("Allow address to contract error!");
                    $("#LoadModal").hide();
                });
            } else {
                contract.disallowAddressToContract(address, {from: Vin.web3.eth.accounts[0]}).then(function() {
                    $("#form31622adr2").val('')
                    $("#LoadModal").hide();
                }).catch(function(error) {
                    console.error(error);
                    $scope.error = error.message;
                    showErrorDialog("Disallow address to contract error!");
                    $("#LoadModal").hide();
                });
            }
        }
    });
});