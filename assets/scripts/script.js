var searchMethod;
var searchMethods = { // A list of all of our possible search method functions
  title: previewByTitle,
  author: previewByAuthor,
  isbn: previewByISBN,
  lccn: previewByLCCN,
  oclc: previewByOCLC
};
var searchPreviewCall = null;
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
  // When typing in search bar
  $(document).on('keydown', '#search-bar', search);

  $(document).on('click', '.search-result', function() {
    loadByID($(this).attr('data-id'));
    hideSearchPreview();
  });

  // When clicking away from search bar
  //$('#search-bar').on('focusout', hideSearchPreview);

  // When clicking on search bar
  $('#search-bar').on('focusin', showSearchPreview);

  // Update search method when clicked
  $('#dropdown1').on('click', 'a', function() {
    setSearchMethod($(this).text());
  });

  // Search for book when favorite item is clicked
  $('#dropdown2').on('click', 'a', function() {
    loadByID($(this).attr('data-id'));
  });
  
  // Show favorites list when clicked
  $('#fav-list').on('click', loadFavoritesList);

  // Drop Down Functionality
  $('#fav-list').dropdown();
  $('#search-by').dropdown();
}

// Runs a search on Google Books's search engine by a book's title,
// grabbing a list of up to the first 5 books found and eventually
// displaying them underneath the search bar
function previewByTitle(title, isPreview) {
  previewBooks('https://www.googleapis.com/books/v1/volumes?orderBy=relevance&key=AIzaSyDydqLQBo9FclGzljl1Iihd5vJBaSWsFXU&maxResults=5&q=' + title, isPreview);
}

// Runs a search on Google Books' search engine by a book's author,
// grabbing a list of up to the first 5 books found and eventually
// displaying them underneath the search bar
function previewByAuthor(author, isPreview) {
  previewBooks('https://www.googleapis.com/books/v1/volumes?orderBy=relevance&key=AIzaSyDydqLQBo9FclGzljl1Iihd5vJBaSWsFXU&maxResults=5&q=:inauthor:' + author, isPreview);
}

// Gets book info by a book's ISBN
function previewByISBN(isbn, isPreview) {
  previewBooks('https://www.googleapis.com/books/v1/volumes?orderBy=relevance&key=AIzaSyDydqLQBo9FclGzljl1Iihd5vJBaSWsFXU&maxResults=5&q=:isbn=' + isbn, isPreview);
}

// Gets book info by a book's OCLC
function previewByOCLC(oclc, isPreview) {
  previewBooks('https://www.googleapis.com/books/v1/volumes?orderBy=relevance&key=AIzaSyDydqLQBo9FclGzljl1Iihd5vJBaSWsFXU&maxResults=5&q=:oclc=' + oclc, isPreview);
}

// Gets book info by a book's LCCN
function previewByLCCN(lccn, isPreview) {
  previewBooks('https://www.googleapis.com/books/v1/volumes?orderBy=relevance&key=AIzaSyDydqLQBo9FclGzljl1Iihd5vJBaSWsFXU&maxResults=5&q=:lccn=' + lccn, isPreview);
}

function previewBooks(url, isPreview) {
  $.ajax({
    url: url,
    method: 'GET'
  }).then(function(response) {

    if (!isPreview) {
      hideSearchPreview();

      if (response.items != null) {
        showBookInfo(response.items[0]);
      }

    } else {
      $('#search-results').empty();
  
      response.items.forEach(book => {
        let li = $('<li>').attr('class', 'search-result valign-wrapper');
        li.attr('data-id', book.id);

        li.text(book.volumeInfo.title + ' by ' + book.volumeInfo.authors[0]);

        if (book.volumeInfo.imageLinks.thumbnail != undefined) {
          let imgURL = book.volumeInfo.imageLinks.thumbnail.replace(/&edge=curl/, '');
          let img = $('<img>').attr('src', imgURL);
          li.prepend(img);
        }
        
        $('#search-results').append(li);
      });

      // Show the search bar after results load
      showSearchPreview();
    }
  });
}

function loadByID(id) {
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

  updateBookLinks(bookObj);

  currentBook = bookObj;
  checkForFavorite();

  $('#book-content').attr('style', 'visibility: visible');
}

// The function ran using the search bar
function search(e) {
  // Run our search based on the current set search method
  if (e.keyCode == 13) {
    searchMethod($(this).val(), false);
  } else {
    searchMethod($(this).val(), true);
  }
}

function hideSearchPreview() {
  $('#search-results').attr('style', 'display: none');
}

function showSearchPreview() {
  $('#search-results').attr('style', 'display: inline-block');
}

// Sets what method we're searching for a book with
function setSearchMethod(searchOption) {
  $('#search-by').text('Search By: ' + searchOption);

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

  // Create 
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
    $('#fav-icon').attr('class', 'fas fa-times-circle customRemoveFavorites');
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

// Updates the cards at the bottom of the page to contain links and pricing info for book
function updateBookLinks(bookObj) {
  console.log(bookObj);

  $('#amazon-link').attr('href', 'https://www.amazon.com/s?k=' + encodeURIComponent(bookObj.volumeInfo.title) + '&i=stripbooks');
  $('#barnes-link').attr('href', 'https://www.barnesandnoble.com/s/' + encodeURIComponent(bookObj.volumeInfo.title));
  $('#google-link').attr('href', bookObj.volumeInfo.infoLink);

  if (bookObj.saleInfo.saleability == 'NOT_FOR_SALE') {
    $('#google-price').text('Not for sale');
  } else {
    $('#google-price').text('Price: $' + bookObj.saleInfo.listPrice.amount);
  }

  $('#openlib-text').text('Loading...');
  $('#openlib-link').attr('href', '');

  getOpenLibraryInfo(bookObj.volumeInfo.industryIdentifiers[0].identifier);
}

function getOpenLibraryInfo(isbn) {
  $.ajax({
    url: 'https://openlibrary.org/api/books?format=json&bibkeys=ISBN:' + isbn,
    method: 'GET'
  }).then(function (response) {

    if (JSON.stringify(response) === JSON.stringify({}))  {
      console.log('okay');
      $('#openlib-text').text('No book found. Add one below!');
      $('#openlib-link').attr('href', 'https://openlibrary.org/books/add');
    } else {
      console.log('no');
      $('#openlib-text').text('');
      $('#openlib-link').attr('href', response['ISBN:' + isbn].info_url);
    }
  });
}