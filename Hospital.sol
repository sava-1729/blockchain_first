pragma solidity >=0.4.22 <0.7.0;

contract Hospital
{
    address payable private owner;
    uint256 size;
    address[] bed_arr = new address[](0);
    uint256[] free_idx = new uint256[](0);
    event OwnerSet(address indexed oldOwner, address indexed newOwner);

    constructor(uint256 temp_size) public
    {
        size = temp_size;
        owner = msg.sender; // 'msg.sender' is sender of current call, contract deployer for a constructor
        emit OwnerSet(address(0), owner);
        for (uint i = 0; i < size; i++)
        {
            bed_arr.push(address(0));
            free_idx.push(i);
        }
    }
    
    function getOwner() public view returns (address) 
    {
        return owner;
    }
    
    
    function requireBed() public payable
    {
        address temp_address = msg.sender;
        uint256 amt = msg.value;
        bool amt_payed = false;
        if (amt > 10000)
        {
            owner.transfer(amt);
            amt_payed = false;
            require (true, "Payment done");
        }
        else
        {
            require (true, "Payment failed");
        }
        
        if (free_idx.length == 0 && amt_payed)
        {
            require (true, "No bed available");
        }
        else if (amt_payed)
        {
            uint256 temp_bed_num = free_idx[0];
            bed_arr[temp_bed_num] = temp_address;
            free_idx.pop();
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
                require (true, "Bed released");
                bed_arr[i] == address(0);
                free_idx.push(i);
                break;
            }
        }
            require(!flag, "No bed under this user");
    }
}
