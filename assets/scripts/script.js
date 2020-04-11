var searchMethod;
var searchMethods = { // A list of all of our possible search method functions
  title: previewByTitle,
  author: previewByAuthor,
  isbn: searchBookISBN,
  oclc: searchBookOCLC,
  lccn: searchBookLCCN,
  olid: searchBookOLID
};

$(document).ready(function() {
  
  // Auto-populate dropdown text with default search method (Title)
  setSearchMethod('Title');
  
  $(document).on('keydown', '#search-bar', tempSearch);
  $('#dropdown1').on('click', 'a', function() {
    setSearchMethod($(this).text());
  });
  
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
      searchBookISBN(bookList[0].isbn[0]);
    }
  });
}

// Runs a search on OpenLibrary's search engine by a book's author,
// grabbing a list of up to the first 5 books found and eventually
// displaying them underneath the search bar
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
      searchBookISBN(bookList[0].isbn[0]);
    }
  });
}

// Gets book info by a book's ISBN
function searchBookISBN(isbn) {
  searchBook('ISBN', isbn);
}

// Gets book info by a book's OCLC
function searchBookOCLC(oclc) {
  searchBook('OCLC', oclc);
}

// Gets book info by a book's LCCN
function searchBookLCCN(lccn) {
  searchBook('LCCN', lccn);
}

// Gets book info by a book's OLID
function searchBookOLID(olid) {
  searchBook('OLID', olid);
}

// Runs AJAX call to get book info, and displays info to page
function searchBook(idType, id) {
  $.ajax({
    url: 'https://openlibrary.org/api/books?bibkeys=' + idType + ':' + id + '&jscmd=data&format=json',
    method: 'GET'
  }).then(function(response) {
    console.log(response);

    $('.book-img').empty();

    // TODO: Display book to webpage, update webpage info
    if (response[idType + ':' + id].cover != undefined) {
      let img = $('<img>').attr('src', response[idType + ':' + id].cover.large);
      $('.book-img').append(img);
    }
  });
}

// The function ran when pressing 'enter' in the search bar
function tempSearch(e) {

  // Run our search based on the current set search method
  if (e.keyCode == 13) {
    searchMethod($(this).val());
  }
}

// Sets what method we're searching for a book with
function setSearchMethod(searchOption) {
  $('.dropdown-trigger').text(searchOption);

  searchMethod = searchMethods[searchOption.toLowerCase()];
}