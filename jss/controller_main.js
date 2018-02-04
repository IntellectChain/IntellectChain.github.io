
var app = angular.module("mySimpleWalletDapp");

var getKeyByValueMain = function(obj, value) {
    for( var prop in obj ) {
        if( obj.hasOwnProperty( prop ) ) {
             if( obj[ prop ] === value )
                 return prop;
        }
    }
}

app.controller("MainController", function ($scope) {

    $("#LoadModal").show();
    $scope.search_block = true;
    $scope.result_block = false;

    $("#close_report").click(function() {
        $scope.search_block = true;
        $scope.result_block = false;
        $scope.$apply();
        $("#close_report").hide();
    })

    Vin.init(function(contract) {

        var instance = contract;

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

        var showVinData  = function(contr, vin) {
            $("#form3162").val("");
            contr.getVinDataSize(vin).then(function(result) {
                console.log(result);
                var carTyp = result[0].toNumber();
                var size = result[1].toNumber();
                console.log(size);

                if (carTyp == 0) {
                    if (!(vin in carsMapping)) {
                        carTyp = Math.floor(Math.random() * 16) + 1;
                    } else {
                        carTyp = getKeyByValueMain(carsArray, carsMapping[vin]);
                    }
                }

                if (size > 0) {
                    $scope.search_block = false;
                    $scope.result_block = true;
                    $("#close_report").show();

                    $("#carType").text(carsArray[carTyp]);
                    $("#vinString").text("VIN: " + vin);
                    $("#r-date").text("Report date: " + new Date().toString())
                    var span_milage = 0;
                    var span_acci = 0;

                    for (var i = 0; i < size; i++) {
                        instance.getVinRecor(vin, i).then(function(result) {
                            console.log(i + " " + result)
                            var recordType = result[0].toNumber();
                            var date = result[1];
                            var milage = result[2].toNumber();
                            var comment = result[3];
                            $scope.vinInfo.push({type:serviceIconcArray[recordType], date: new Date(date*1000).toString(), milage:milage, comment:comment});
                            $scope.$apply();

                            if (span_milage < milage) {
                                span_milage = milage;
                            }
                            if (recordType == 3) {
                                span_acci = span_acci + 1;
                            }
                            $("#Span_Milage").text(span_milage);
                            $("#Span_Accidents").text(span_acci);
                        });
                    }

                } else {
                    showErrorDialog("No records found!");
                }
                $("#LoadModal").hide();

            }).catch(function(error) {
                console.error(error);
                $scope.error = error.message;
                showErrorDialog("Get VIN data size error!");
                $("#LoadModal").hide();
            });
        }

        $scope.getVinInfo = function(vin) {
            if ($('#form3162').val().length === 0) {
                return;
            }

            $scope.vinInfo = [];
            $("#LoadModal").show();

            Vin.init(function(contract) {

                var instance = contract;

                contract.isAllowedToView.call(Vin.web3.eth.accounts[0]).then(function(isAllowed) {
                    if (isAllowed) {
                        showVinData(contract, vin);
                    } else {
                        $("#LoadModal").hide();
                        $("#getAccess1_vin").val(vin);
                        $("#getAccess2_vin").val(vin);

                        $("#close_get_access").click(function() {
                            $scope.get_accec_modal = false;
                            $scope.$apply();
                        })

                        $scope.get_accec_modal = true;
                        $scope.$apply();
                    }
                });

            });

        }

        var getAccess = function(vin, variant) {
            $scope.get_accec_modal = false;
            $("#LoadModal").show();
            Vin.init(function(contract) {

                contract.getAccess({from: Vin.web3.eth.accounts[0], value: Vin.web3.toWei(0.01*variant, "ether")}).then(function() {
                    showVinData(contract, vin);

                    $("#LoadModal").hide();
                }).catch(function(error) {
                    console.error(error);
                    $scope.error = error.message;
                    showErrorDialog("Get access error!");
                    $("#LoadModal").hide();
                });
            });
            
        }

        $scope.getAccess1 = function(vin) {
            getAccess(vin, 1);
        }

        $scope.getAccess2 = function(vin) {
            getAccess(vin, 2);
        }

        $("#LoadModal").hide();

    });

});