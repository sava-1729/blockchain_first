pragma solidity ^0.5.1;

contract RVHospital
{
    address public owner;
    enum wardType { General, SemiPrivate, Private }
    address[] public patientAtBed = new address[](0);
    uint256[] public freeBeds = new uint256[](0);
    mapping(address => wardType) assignedWard;
    mapping(address => uint256) dues;
    uint256 private hospitalFunds;
    uint256 private reserveFunds;
    event OwnerSet(address indexed oldOwner, address indexed newOwner);
    event AdmittedPatient(address indexed patientAddress);
    event CapacityFull();
    event DischargedPatient(address indexed patientAddress);
    event UnauthorizedDischargeRequest(address indexed perpetrator, address indexed patientAddress);
    event NewDoctorEmployed(address indexed doctorAddress);
    event UnauthorizedEmploymentRequest(address indexed perpetrator, address indexed applicantAddress);
    string private capacityStr;
    uint256 private capacity;
    string private admissionCostStr;
    uint256 private admissionCost;
    string private membershipCostStr;
    uint256 private membershipCost;
    address[] private privilegedMembers = new address[](0);
    address[] private doctors = new address[](0);

    constructor(string memory capacity_, string memory admissionCost_, string memory membershipCost_) public payable
    {
        capacityStr = capacity_;
        capacity = stringToUint256(capacity_);
        admissionCostStr = admissionCost_;
        admissionCost = stringToUint256(admissionCost_);
        membershipCostStr = membershipCost_;
        membershipCost = stringToUint256(membershipCost_);
        owner = msg.sender; // 'msg.sender' is sender of current call, contract deployer for a constructor
        emit OwnerSet(address(0), owner);
        for (uint256 i = 0; i < capacity; i++)
        {
            patientAtBed.push(owner);
            freeBeds.push(i);
        }
        hospitalFunds = msg.value / 2;
        reserveFunds = msg.value - hospitalFunds;
    }

    function getAdmitted(address patientAddress, wardType wardType_) public payable
    {
        if (freeBeds.length == 0)
        {
            emit CapacityFull();
            revert('The hospital capacity has been exhausted. Request owner to increase capacity.');
        }
        else if (isAdmitted(patientAddress) != -1)
        {
            revert('Request address is already admitted.');
        }
        else
        {
            uint256 freeBedIdx = freeBeds[freeBeds.length - 1];
            patientAtBed[freeBedIdx] = patientAddress;
            freeBeds.pop();
            emit AdmittedPatient(patientAddress);
            assignedWard[patientAddress] = wardType_;
            if (admissionCost < msg.value)
            {
                msg.sender.transfer(msg.value - admissionCost);
                dues[patientAddress] = 0;
            }
            else
            {
                dues[patientAddress] = admissionCost - msg.value;
            }
        }
    }

    function getAdmitted(address patientAddress) public payable
    {
        getAdmitted(patientAddress, wardType.General);
    }

    function dischargePatient(address patientAddress) public
    {
        int256 location = isAdmitted(patientAddress);
        if (location == -1)
        {
            revert('Requested address is currently not admitted.');
        }
        else if (isDoctor(msg.sender) == -1)
        {
            emit UnauthorizedDischargeRequest(msg.sender, patientAddress);
            revert('You are not authorized to perform this action. Request denied.');
        }
        else if (dues[patientAddress] > 0 && (isPrivilegedMember(patientAddress) != -1))
        {
            revert('The patient has uncleared dues.');
        }
        else
        {
            patientAtBed[uint256(location)] = owner;
            freeBeds.push(uint256(location));
            emit DischargedPatient(patientAddress);
        }
    }

    function registerAsPrivilegedMember(address personAddress) public payable
    {
        if (isPrivilegedMember(personAddress) != -1)
        {
            revert('Requested address is already a privileged member.');
        }
        else if (msg.value != membershipCost)
        {
            revert(string(abi.encodePacked('Privileged Membership Cost is ', membershipCostStr, ' wei.')));
        }
        else
        {
            privilegedMembers.push(personAddress);
        }
    }

    function employDoctor(address applicantAddress) public
    {
        if (msg.sender != owner)
        {
            emit UnauthorizedEmploymentRequest(msg.sender, applicantAddress);
            revert('You are not authorized to perform this action. Request denied.');
        }
        else if (isDoctor(applicantAddress) != -1)
        {
            revert('Requested address is already an employed doctor.');
        }
        else
        {
            doctors.push(applicantAddress);
            emit NewDoctorEmployed(applicantAddress);
        }
    }

    function isPrivilegedMember(address personAddress) public view returns (int256)
    {
        int256 index = -1;
        for (uint256 i = 0; i < capacity; i++)
        {
            if (privilegedMembers[i] == personAddress)
            {
                index = int256(i);
            }
        }
        return index;
    }

    function isAdmitted(address personAddress) public view returns (int256)
    {
        int256 index = -1;
        for (uint256 i = 0; i < capacity; i++)
        {
            if (patientAtBed[i] == personAddress)
            {
                index = int256(i);
            }
        }
        return index;
    }

    function isDoctor(address personAddress) public view returns (int256)
    {
        int256 index = -1;
        for (uint256 i = 0; i < capacity; i++)
        {
            if (doctors[i] == personAddress)
            {
                index = int256(i);
            }
        }
        return index;
    }

    function stringToUint256(string memory x) internal pure returns (uint256) 
    {
        bytes memory b = bytes(x);
        uint256 num = 0;
        for (uint8 i = 0; i < b.length; i++)
        {
            num *= 10;
            uint8 digit = uint8(b[i]) - 48;
            require((digit >= 0) && (digit <= 9));
            num += digit;
        }
        return num;
    }
}
