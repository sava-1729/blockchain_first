pragma solidity ^0.5.1;

contract Hospital
{
    address payable private owner;
    uint256 public size;
    address[] public bed_arr = new address[](0);
    uint256[] public free_idx = new uint256[](0);
    event OwnerSet(address indexed oldOwner, address indexed newOwner);
    event BedAcq(address indexed temp);
    event BedRel(address indexed temp);

    constructor() public
    {
        size = 5;
        owner = msg.sender; // 'msg.sender' is sender of current call, contract deployer for a constructor
        emit OwnerSet(address(0), owner);
        for (uint i = 0; i < size; i++)
        {
            bed_arr.push(owner);
            free_idx.push(i);
        }
    }

    function getOwner() public view returns (address)
    {
        return owner;
    }

    function getFreeBeds() public view returns (uint256[])
    {
        return free_idx;
    }

    function getBeds() public view returns (address[])
    {
        return bed_arr;
    }

    function requireBed(address from_address) public
    {
        if (free_idx.length == 0)
        {
            emit BedAcq(address(0));
        }
        else
        {
            uint256 temp_bed_num = free_idx[0];
            bed_arr[temp_bed_num] = from_address;
            free_idx.pop();
            emit BedAcq(from_address);
        }
    }

    function releaseBed(address from_address) public
    {
        bool flag = false;
        for (uint i = 0; i < size; i++ )
        {
            if (bed_arr[i] == from_address)
            {
                flag = true;
                emit BedRel(from_address);
                bed_arr[i] = owner;
                free_idx.push(i);
                break;
            }
        }
        if (!flag)
            emit BedRel(address(0));
    }
}
