// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/access/Ownable.sol";

pragma solidity ^0.8.9;

contract Library {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    mapping(uint256 => Book) public books;
    mapping(bytes32 => bool) public doesBookExist;
    mapping(address => mapping(uint256 => bool)) public borrowedBooks;
    mapping(uint256 => address[]) public borrowHistory;

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner can do that");
        _;
    }

    modifier checkIfBookExist(uint256 _id) {
        bytes32 keyHash = keccak256(abi.encodePacked(_id));
        require(
            doesBookExist[keyHash] == true,
            "book doesn't exist in our library"
        );
        _;
    }

    struct Book {
        uint256 id;
        string title;
        uint256 price;
        uint256 quantity;
    }

    function AddNewBook(Book calldata book) external onlyOwner {
        bytes32 keyHash = keccak256(abi.encodePacked(book.id));

        if (doesBookExist[keyHash] == true) {
            books[book.id].quantity += book.quantity;
            return;
        }
        doesBookExist[keyHash] = true;
        books[book.id] = book;
    }

    function BorrowBook(uint256 _id) external checkIfBookExist(_id) {
        require(borrowedBooks[msg.sender][_id] == false, "borroled already");
        require(books[_id].quantity > 0, "we dont'have this book already");
        borrowedBooks[msg.sender][_id] = true;
        books[_id].quantity--;
        borrowHistory[_id].push(msg.sender);
    }

    function ReturnBook(uint256 _id) external {
        require(
            borrowedBooks[msg.sender][_id] == true,
            "you aren't borrowed this book"
        );
        borrowedBooks[msg.sender][_id] = false;
        books[_id].quantity++;
    }

    function BookTenantsHistory(uint256 _Id)
        external
        view
        returns (address[] memory)
    {
        return borrowHistory[_Id];
    }
}
