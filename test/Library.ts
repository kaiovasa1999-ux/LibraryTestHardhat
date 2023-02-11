import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

import { expect } from "chai";
import { ethers } from "hardhat";

import { Library } from "../typechain-types";

describe('Library', function (){
    let libraryFactory;
    let library: Library

    async function everyTime() {
        const [owner, otherAccount] = await ethers.getSigners();
        libraryFactory = await ethers.getContractFactory("Library");
        library = await libraryFactory.deploy();
        const book = [1,"XXX",10,5];
     
        await library.deployed();
        return { library, owner, otherAccount,book};
    }

    describe('Deployment',function() {
        it("Should set the right owner", async function(){
            const {library,owner} = await loadFixture(everyTime);
            expect(await library.owner()).to.equal(owner.address);
        })
    });

    describe("AddNewBook", function () {
       
        it("Should add book proper", async function(){
            const {book} = await loadFixture(everyTime);
            const addBookTx = await library.AddNewBook(book);
            await addBookTx.wait();
            let x = await library.books(1);
            expect(x.title).to.equal("XXX");
        });
        it('Should increase the quanitiy if book exist',async function(){
            const book = [1,"XXX",10,5];
            const addBookTx = await library.AddNewBook(book);
            await addBookTx.wait();
            let x = await library.books(1)
            expect(x.id).to.equal(1);
        });

 
        it("Should throw an error when try to add book with diferent address", async function() {
            const {book,otherAccount} = await loadFixture(everyTime);
            await expect(library.connect(otherAccount).AddNewBook(book)).to.be.revertedWith('only owner can do that')
        });
    });

    describe("BorrowBook", function() {
        it("BorrowBook proper",async function(){
            const bookX = [3,"AFSD",5,5];
            const addTx = await library.AddNewBook(bookX);
            await addTx.wait();
            const borrwTx = await library.BorrowBook(3);
            await borrwTx.wait();
            
            const x = (await library.books(3)).quantity;
            expect(x).to.equal(4);
            
        });

        it("Should thowr an error when try to borrow book whic ain't exist",async function(){
            const {owner} = await loadFixture(everyTime);
            expect(library.connect(owner).BorrowBook(1)).to.be.revertedWith("we dont'have this book already");
        })
        it('Should throw an error when borrow book with 0 quantity', async function(){
            const {owner} = loadFixture(everyTime);
            const book = [2,"xafs",1,0];
            const addTx = await library.AddNewBook(book);
            await addTx.wait();
            expect(library.BorrowBook(2)).to.be.revertedWith("we dont'have this book already")        
        })
    })

    // describe("History Log", function() {
    //     it("Shoult log proper history when someone borrow a book", async function(){
    //         const {owner,book} = await loadFixture(everyTime);
    //         const addBookTx = await library.connect(owner).AddNewBook(book);
    //         await addBookTx.wait();
    //         const borrowTx = await library.connect(owner).BorrowBook(1);
    //         await borrowTx.wait();

    //         let addr = await library.borrowHistory(1);
            
    //        await expect(addr).to.equal(owner.address);
    //     })
    // });

    describe("return book",function(){
        it("should return book proper", async function(){
            const {book,owner} = await loadFixture(everyTime);
            const addTx = await library.AddNewBook(book);
            await addTx.wait();
            const borrwTx = await library.BorrowBook(1);
            await borrwTx.wait();
            const returnTx = await library.ReturnBook(1);
            await returnTx.wait();
            let x = await library.books(1);
            expect(x.quantity).to.equal(5);
        });
    })
})