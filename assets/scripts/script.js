var searchMethod;
var searchMethods = { // A list of all of our possible search method functions
  title: previewByTitle,
  author: previewByAuthor,
  isbn: previewByISBN,
  lccn: previewByLCCN,
  oclc: previewByOCLC
};
var currentBook = null;
var favoritesList;

$(document).ready(function() {
  $.ajax({
    url: 'https://www.googleapis.com/books/v1/volumes/5iTebBW-w7QC',
    method: 'GET'
  }).then(function(response) {
    console.log(response);
  });

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
    loadFavorite($(this).attr('data-id'));
  });
  
  // Show favorites list when clicked
  $('#fav-list').on('click', loadFavoritesList);

  // Drop Down Functionality
  $('#fav-list').dropdown();
  $('#search-by').dropdown();
}

// Runs a search on OpenLibrary's search engine by a book's title,
// grabbing a list of up to the first 5 books found and eventually
// displaying them underneath the search bar
function previewByTitle(title) {
  previewBooks('https://www.googleapis.com/books/v1/volumes?key=AIzaSyDydqLQBo9FclGzljl1Iihd5vJBaSWsFXU&maxResults=5&q=' + title);
}

// Runs a search on OpenLibrary's search engine by a book's author,
// grabbing a list of up to the first 5 books found and eventually
// displaying them underneath the search bar
function previewByAuthor(author) {
  previewBooks('https://www.googleapis.com/books/v1/volumes?key=AIzaSyDydqLQBo9FclGzljl1Iihd5vJBaSWsFXU&q=:inauthor:' + author);
}

// Gets book info by a book's ISBN
function previewByISBN(isbn) {
  previewBooks('https://www.googleapis.com/books/v1/volumes?key=AIzaSyDydqLQBo9FclGzljl1Iihd5vJBaSWsFXU&q=:isbn=' + isbn);
}

// Gets book info by a book's OCLC
function previewByOCLC(oclc) {
  previewBooks('https://www.googleapis.com/books/v1/volumes?key=AIzaSyDydqLQBo9FclGzljl1Iihd5vJBaSWsFXU&q=:oclc=' + oclc);
}

// Gets book info by a book's LCCN
function previewByLCCN(lccn) {
  previewBooks('https://www.googleapis.com/books/v1/volumes?key=AIzaSyDydqLQBo9FclGzljl1Iihd5vJBaSWsFXU&q=:lccn=' + lccn);
}

function previewBooks(url) {
  $.ajax({
    url: url,
    method: 'GET'
  }).then(function(response) {
    let bookList = [];

    // Only grab the first 5 books from our search
    for (let i = 0; i < response.items.length; i++) {
      bookList.push(response.items[i]);
    }

    // Temporarily do this
    if (bookList[0] != undefined) {
      showBookInfo(bookList[0]);
    }
  });
}

function loadFavorite(id) {
  $.ajax({
    url: 'https://www.googleapis.com/books/v1/volumes/' + id,
    method: 'GET'
  }).then(function(response) {
    showBookInfo(response);
  });
}

function showBookInfo(bookObj) {
  $('#book-img').empty();

  let imgURL = bookObj.volumeInfo.imageLinks.thumbnail;
  imgURL = imgURL.replace(/&edge=curl/, '');

  let img = $('<img>').attr('src', imgURL);

  $('#book-img').append(img);
  $('#book-title').text(bookObj.volumeInfo.title);
  $('#author').text(bookObj.volumeInfo.authors[0]); // TODO: make all authors show their names if multiple
  $('#page-count').text(bookObj.volumeInfo.pageCount);
  $('#summaryContent').html(bookObj.volumeInfo.description);

  // Say no defined categories if not defined
  if (typeof bookObj.volumeInfo.categories != 'undefined') {
    $('#subjects').text(bookObj.volumeInfo.categories[0]);
  } else {
    $('#subjects').text('No defined categories');
  }
  
  // Say not rated if not ratings yet
  if (typeof bookObj.volumeInfo.averageRating != 'undefined') {
    $('#book-rating').text(bookObj.volumeInfo.averageRating + '/5');
  } else {
    $('#book-rating').text('None');
  }

  currentBook = bookObj;
  checkForFavorite();
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
  if (isInFavorites(currentBook.id) == -1) {
    favoritesList.push(currentBook);

    checkForFavorite();
  }

  localStorage.setItem('favoritesList', JSON.stringify(favoritesList));
}

function removeFavorite() {
  let index = isInFavorites(currentBook.id);
  if (index != -1) {
    favoritesList.splice(index, 1);

    checkForFavorite();
  }

  localStorage.setItem('favoritesList', JSON.stringify(favoritesList));
}

function isInFavorites(id) {
  for (let i = 0; i < favoritesList.length; i++) {
    if (favoritesList[i].id == id) {
      return i;
    }
  }
  
  return -1;
}

function loadFavoritesList() {
  $('#dropdown2').empty();

  favoritesList.forEach(book => {
    let listItem = $('<li>');
    let link = $('<a>');
    link.attr('class', 'white-text');
    link.attr('data-id', book.id);
    link.text(book.volumeInfo.title);

    listItem.append(link);

    $('#dropdown2').append(listItem);
  });
}

function checkForFavorite() {
  if (isInFavorites(currentBook.id) != -1) {
    $('#fav-icon').attr('class', 'fas fa-times-circle');
    $('#fav-btn-txt').text('Remove from Favorites List');

    // Remove from favorites list
    $('#fav-icon').on('click', removeFavorite);
  } else {
    $('#fav-icon').attr('class', 'fas fa-heart');
    $('#fav-btn-txt').text('Add to Favorites List');

    // Add to favorites list
    $('#fav-icon').on('click', addFavorite);
  }
}