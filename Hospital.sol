pragma solidity ^0.5.1;

contract RVHospital
{
    address public owner;
    address[] public patientAtBed = new address[](0);
    uint256[] public freeBeds = new uint256[](0);
    uint256 private hospitalFunds;
    uint256 private reserveFunds;
    event OwnerSet(address indexed oldOwner, address indexed newOwner);
    event AdmittedPatient(address indexed temp);
    event DischargedPatient(address indexed temp);
    event CapacityFull(string report);
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
        for (uint i = 0; i < capacity; i++)
        {
            patientAtBed.push(owner);
            freeBeds.push(i);
        }
        hospitalFunds = msg.value / 2;
        reserveFunds = msg.value - hospitalFunds;
    }

    function getOwner() public view returns (address)
    {
        return owner;
    }

    function getFreeBeds() public view returns (uint256[] memory)
    {
        return freeBeds;
    }

    function getBeds() public view returns (address[] memory)
    {
        return patientAtBed;
    }

    function getAdmitted(address applicantAddress) public payable
    {
        if (freeBeds.length == 0)
        {
            emit CapacityFull('The hospital capacity has been exhausted. Request owner to increase capacity.');
        }
        else
        {
            for(uint i = 0; i < patientAtBed.length; i++)
            {
                if(patientAtBed[i] == applicantAddress)
                {
                    revert('Request address is already admitted.');
                }
            }
            uint256 temp_bed_num = freeBeds[freeBeds.length - 1];
            patientAtBed[temp_bed_num] = applicantAddress;
            freeBeds.pop();
            emit AdmittedPatient(applicantAddress);
        }
    }

    function dischargePatient(address patientAddress) public
    {
        for(uint i = 0; i < doctors.length; i++)
        {
            if(doctors[i] == msg.sender)
            {
                bool admitted = false;
                for (uint j = 0; j < capacity; j++ )
                {
                    if (patientAtBed[j] == patientAddress)
                    {
                        admitted = true;
                        patientAtBed[j] = owner;
                        freeBeds.push(j);
                        emit DischargedPatient(patientAddress);
                        break;
                    }
                }
                if (!admitted)
                {
                    revert('Requested address is currently not admitted.');
                }
                break;
            }
        }
    }

    function registerAsPrivilegedMember(address personAddress) public payable
    {
        for(uint i = 0; i < capacity; i++)
        {
            if(privilegedMembers[i] == personAddress)
            {
                revert('Requested address is already registered as a privileged member.');
            }
        }
        if(msg.value != membershipCost)
        {
            revert(string(abi.encodePacked('Privileged Membership Cost is ', membershipCostStr, ' wei.')));
        }
        privilegedMembers.push(personAddress);
    }

    function employDoctor(address applicantAddress) public
    {
        if (msg.sender == owner)
        {
            for(uint i = 0; i < doctors.length; i++)
            {
                if(doctors[i] == applicantAddress)
                {
                    revert('Requested address is already an employed doctor.');
                }
            }
            doctors.push(applicantAddress);
            emit NewDoctorEmployed(applicantAddress);
        }
        else
        {
            emit UnauthorizedEmploymentRequest(msg.sender, applicantAddress);
        }
    }

    function stringToUint256(string memory x) internal pure returns (uint256) 
    {
        bytes memory b = bytes(x);
        uint256 num = 0;
        for(uint8 i = 0; i < b.length; i++)
        {
            num *= 10;
            uint8 digit = uint8(b[i]) - 48;
            require((digit >= 0) && (digit <= 9));
            num += digit;
        }
        return num;
    }
}
