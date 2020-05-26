pragma solidity >=0.4.22 <0.7.0;

contract Hospital
{
    address payable private owner;
    uint256 public size;
    address[] public bed_arr = new address[](0);
    uint256[] public free_idx = new uint256[](0);
    event OwnerSet(address indexed oldOwner, address indexed newOwner);
    event BedAcq(address indexed temp);
    event BedRel(address indexed temp);

    constructor(uint256 temp_size) public
    {
        size = temp_size;
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
    
    function requireBed(address to_address, uint256 amt) public
    {
        address temp_address = msg.sender;
        if (amt > 10000 && to_address == owner)
        {
            if (free_idx.length == 0)
            {
                BedAcq(address(0));
            }
            else
            {
                uint256 temp_bed_num = free_idx[0];
                bed_arr[temp_bed_num] = temp_address;
                free_idx.pop();
                BedAcq(temp_address);
            }
        }
    }
    
    function releaseBed() public
    {
        address temp = msg.sender;
        bool flag = false;
        for (uint i = 0; i < size; i++ )
        {
            if (bed_arr[i] == temp)
            {
                flag = true;
                BedRel(msg.sender);
                bed_arr[i] = owner;
                free_idx.push(i);
                break;
            }
        }
        if (!flag)
        BedRel(address(0));
        
    }
}
