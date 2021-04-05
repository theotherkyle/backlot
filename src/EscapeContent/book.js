// book.js


// note not compatible with node/glitch 


const favoriteBook = {
    title: "The Guards",
    author: "Ken Bruen"
}

// a Book class using ES6 class syntax
class Book {
    constructor(title, author) {
        this.title = title;
        this.author = author;
    }

    describeBook() {
        let description = this.title + " by " + this.author + ".";
        return description;
    }
}

// exporting looks different from Node.js but is almost as simple
export {favoriteBook, Book};