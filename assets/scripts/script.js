$(document).ready(function() {
  previewByAuthor('Eiichiro Oda');

  // Drop Down Functionality
  $('.dropdown-trigger').dropdown();
});

// Runs a search on OpenLibrary's search engine by a book's title,
// grabbing a list of up to the first 5 books found and eventually
// displaying them underneath the search bar
function previewByTitle(title) {
  $.ajax({
    url: 'https://openlibrary.org/search.json?title=' + title,
    method: 'GET'
  }).then(function(response) {
    let bookList = [];

    // Only grab the first 5 books from our search
    for (let i = 0; i < response.docs.length; i++) {
      if (i === 5) {
        break;
      }

      bookList.push(response.docs[i]);
    }

    bookList.forEach(book => {
      // TODO: Should display a list of the books under search
    });

    // Temporarily do this
    if (bookList[0] != undefined) {
      searchBook(bookList[0].isbn[0]);
    }
  });
}

function previewByAuthor(author) {
  $.ajax({
    url: 'https://openlibrary.org/search.json?author=' + author,
    method: 'GET'
  }).then(function(response) {
    let bookList = [];

    // We only want to grab the first 5 books available
    for (let i = 0; i < response.docs.length; i++) {
      if (i === 5) {
        break;
      }

      bookList.push(response.docs[i]);
    }

    bookList.forEach(book => {
      // TODO: Should display a list of the books under search
    });

    // Temporarily do this
    if (bookList[0] != undefined) {
      searchBook(bookList[0].isbn[0]);
    }
  });
}

// Gets book info by a book's ISBN and displays it to the webpage.c
function searchBook(isbn) {
  $.ajax({
    url: 'https://openlibrary.org/api/books?bibkeys=ISBN:' + isbn + '&jscmd=data&format=json',
    method: 'GET'
  }).then(function(response) {
    console.log(response);

    $('.book.img').empty();

    // TODO: Display book to webpage, update webpage info
    if (response['ISBN:' + isbn].cover != undefined) {
      let img = $('<img>').attr('src', response['ISBN:' + isbn].cover.large);
      $('.book-img').append(img);
    }
  });
}