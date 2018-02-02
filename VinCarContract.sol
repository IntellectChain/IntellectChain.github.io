pragma solidity ^0.4.17;

contract VinCarContract {

    struct RecordStruct {
        string comment;
        uint recordType;
        uint date;
        uint milage;
    }

    struct VinStruct {
        string info;
        uint carType;
        RecordStruct[] records;
    }
    
    struct ContractorStruct {
        bool allowed;
    }
    
    struct AccessKey {
        uint timeStart;
    }

    uint constant _amount = 10000000000000000;
    address _owner;
    mapping(string =>  VinStruct) _vinStruct;
    mapping(address => ContractorStruct) _isAllowedToContract;
    mapping(address => AccessKey) _isAllowedToView;
    
    function VinCarContract() public {
        _owner = msg.sender;
    }
    
    modifier restricted() {
        if (msg.sender == _owner) _;
    }
    
    function getOwner() public restricted constant returns (address) {
        return _owner;
    }
    
    function sendFunds(uint amount, address receiver) public restricted returns (uint) {
        if(this.balance >= amount) {
            receiver.transfer(amount);
            return this.balance;
        }
    }
    
    function allowAddressToContract(address _address)  public restricted {
        _isAllowedToContract[_address].allowed = true;
    }
    
    function disallowAddressToContract(address _address)  public restricted {
        _isAllowedToContract[_address].allowed = false;
    }

    function isAllowedAddressToContract(address _address) public constant returns (bool) {
        return _isAllowedToContract[_address].allowed || _address == _owner;
    }
    
    function isAllowedToView(address _address) public constant returns (bool) {
        return (_isAllowedToView[_address].timeStart > 0
                && int(_isAllowedToView[_address].timeStart - now) > 0)
            || isAllowedAddressToContract(_address); 
    }
    
    function getAccess() public payable {
        if (isAllowedAddressToContract(msg.sender)
            || msg.value >= _amount){
            _isAllowedToView[msg.sender].timeStart = now + 10 minutes * uint(msg.value) / uint(_amount);
        }
    }
    
    function getAccessTime() public constant returns (uint){
        return _isAllowedToView[msg.sender].timeStart - now;
    }
    
    function addVin(string vin, uint carType, string info) public {
        if (isAllowedAddressToContract(msg.sender)){
            _vinStruct[vin].info = info;
            _vinStruct[vin].carType = carType;
        }
    }
    
    function addRecord(string vin, uint carType, uint recordType, uint date, uint milage, string comment) public {
        if (isAllowedAddressToContract(msg.sender)){
            RecordStruct memory record = RecordStruct(comment, recordType, date, milage);
            _vinStruct[vin].carType = carType;
            _vinStruct[vin].records.push(record);
        }
    }
    
    function getVinDataSize(string vin) public constant returns (uint, uint, string){
        if (isAllowedToView(msg.sender)){
            VinStruct memory vinStruct = _vinStruct[vin];
            return (vinStruct.carType, vinStruct.records.length, vinStruct.info);
        }
    }
    
    function getVinRecor(string vin, uint index) public constant returns (uint, uint, uint, string){
        if (isAllowedToView(msg.sender) && _vinStruct[vin].records.length > index){
            RecordStruct memory record = _vinStruct[vin].records[index];
            return (record.recordType, record.date, record.milage, record.comment);
        }
    }
    
}