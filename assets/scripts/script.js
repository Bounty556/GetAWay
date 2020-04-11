var searchMethod;
var searchMethods = { // A list of all of our possible search method functions
  title: previewByTitle,
  author: previewByAuthor,
  isbn: searchBookISBN,
  oclc: searchBookOCLC,
  lccn: searchBookLCCN,
  olid: searchBookOLID
};
var currentBook = null;
var favoritesList;

$(document).ready(function() {
  
  // Auto-populate dropdown text with default search method (Title)
  setSearchMethod('Title');
  
  // Get favorites list
  favoritesList = JSON.parse(localStorage.getItem('favoritesList')) || [];

  init();
});

// Sets initial callbacks
function init() {
  $(document).on('keydown', '#search-bar', tempSearch);

  // Update search method when clicked
  $('#dropdown1').on('click', 'a', function() {
    setSearchMethod($(this).text());
  });

  // Search for book when favorite item is clicked
  $('#dropdown2').on('click', 'a', function() {
    searchBookISBN($(this).attr('data-isbn'));
  });
  
  // Show favorites list when clicked
  $('#fav-list').on('click', loadFavoritesList);

  // Add to favorites list
  $('.fa-heart').on('click', addFavorite);

  // Drop Down Functionality
  $('#fav-list').dropdown();
  $('#search-by').dropdown();
}

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

    currentBook = {
      title: response[idType + ':' + id].title,
      isbn: id
    };

    // TODO: Check if this is in favorites list. If so, change favorite button to unfavorite button

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
  $('#search-by').text(searchOption);

  searchMethod = searchMethods[searchOption.toLowerCase()];
}

function addFavorite() {
  if (currentBook == null) {
    return;
  }

  // Check if current book is already in favorites list
  if (!isInFavorites(currentBook.isbn)) {
    favoritesList.push(currentBook);
  }

  localStorage.setItem('favoritesList', JSON.stringify(favoritesList));
}

function isInFavorites(isbn) {

  let isFound = false;

  favoritesList.forEach(book => {
    console.log(book.isbn, isbn);

    if (book.isbn == isbn) {
      isFound = true;
    }
  });

  return isFound;
}

function loadFavoritesList() {
  $('#dropdown2').empty();

  favoritesList.forEach(book => {
    let listItem = $('<li>');
    let link = $('<a>');
    link.attr('class', 'white-text');
    link.attr('data-isbn', book.isbn);
    link.text(book.title);

    listItem.append(link);

    $('#dropdown2').append(listItem);
  });
}


function makeAmazonAPICall(title, author) {
  let accessKey = 'AKIAI2EYVAYC5BALQWYQ';
  let associatesID = 'bounty556-20';
  let secret = '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';
  let timestamp = new Date().toISOString();

  timestamp = timestamp.substr(0, timestamp.indexOf('.')) + '.000Z';

  let params = [
    'AWSAccessKeyId=' + accessKey,
    'AssociateTeg=' + associatesID,
    'Author=' + encodeURIComponent(author),
    'Operation=ItemSearch',
    'SearchIndex=Books',
    'Service=AWSECommerceService',
    'Timestamp=' + encodeURIComponent(timestamp),
    'Title=' + encodeURIComponent(title),
    'Version=' + encodeURIComponent('2013-08-01')
  ];

  let queryString = '';

  for (let i = 0; i < params.length; i++) {
    queryString = queryString.concat(params[i] + '&');
  }

  let stringToSign = `GET
  webservices.amazon.com
  /onca/xml
  `+ queryString;

  let hash = CryptoJS.HmacSHA256(stringToSign, secret);
  let hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
  hashInBase64 = hashInBase64.replace(/[+]/g, '%2B');
  hashInBase64 = hashInBase64.replace(/=/g, '%3D');

  queryString = queryString.concat('Signature=' + hashInBase64);

  console.log(queryString);

  $.ajax({
    url: 'https://cors-anywhere.herokuapp.com/https://webservices.amazon.com/onca/xml?' + queryString,
    method: 'GET'
  }).then(function(response) {
    console.log(response);
  });
}

function makeEbayAPICall(title, author) {
//TODO: Fix this tomorrow when I get my API key
//   $.ajax({
//     url: 'https://cors-anywhere.herokuapp.com/https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search',
//     method: 'GET',
//     headers: {
//       q: 'testing'
//     },
//     data: {
//       q: 'testing'
//     },
//     error: function (error) {
//       console.log(error);
//     }
//   }).then(function(response) {
//     console.log(response);
//   });
}
