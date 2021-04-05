// library.js

// note not compatible with node/glitch 

// import the book module
import {favoriteBook, Book} from 'book';

// create some books and get their descriptions
let booksILike = [
    new Book("Under The Dome", "Steven King"),
    new Book("Julius Ceasar", "William Shakespeare")
];

console.log("My favorite book is " + favoriteBook + ".");
console.log("I also like " + booksILike[0].describeBook() + " and " + booksILike[1].describeBook());