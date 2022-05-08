const { nanoid } = require('nanoid');
const books = require('../utils/books');
const errorHandling = require('../utils/errorHandling');

const addBook = (request, h) => {
  try {
    const {
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
    } = request.payload;

    if (name === undefined) {
      return errorHandling(
        h,
        400,
        'fail',
        'Gagal menambahkan buku. Mohon isi nama buku',
      );
    }

    if (readPage > pageCount) {
      return errorHandling(
        h,
        400,
        'fail',
        'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
      );
    }

    const id = nanoid(16);
    const finished = readPage === pageCount;
    const currentTimestamp = new Date().toISOString();

    const newBook = {
      id,
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished,
      reading,
      insertedAt: currentTimestamp,
      updatedAt: currentTimestamp,
    };

    books.push(newBook);

    const isSuccess = books.filter((book) => book.id === id).length > 0;

    if (isSuccess) {
      const response = h.response({
        status: 'success',
        message: 'Buku berhasil ditambahkan',
        data: {
          bookId: id,
        },
      });
      response.code(201);
      return response;
    }

    throw new Error('Buku gagal ditambahkan');
  } catch (error) {
    return errorHandling(h, 500, 'error', error.message);
  }
};

const getAllBooks = (request, h) => {
  try {
    const nameQuery = request.query.name;
    const readingQuery = request.query.reading;
    const finishedQuery = request.query.finished;

    let resultQuery = [];

    if (nameQuery !== undefined) {
      resultQuery = books.filter((b) => b.name.toLowerCase().includes(nameQuery.toLowerCase()));
    } else if (readingQuery !== undefined) {
      resultQuery = books.filter((b) => {
        if (Number(readingQuery) === 0 || Number(readingQuery) === 1) {
          return Number(b.reading) === Number(readingQuery);
        }
        return true;
      });
    } else if (finishedQuery !== undefined) {
      resultQuery = books.filter((b) => {
        if (Number(finishedQuery) === 0 || Number(finishedQuery) === 1) {
          return Number(b.finished) === Number(finishedQuery);
        }
        return true;
      });
    }

    if (resultQuery.length > 0) {
      resultQuery = resultQuery.map(({ id, name, publisher }) => ({
        id,
        name,
        publisher,
      }));
    } else {
      resultQuery = books.map(({ id, name, publisher }) => ({
        id,
        name,
        publisher,
      }));
    }

    return h.response({
      status: 'success',
      data: {
        books: resultQuery,
      },
    });
  } catch (error) {
    return errorHandling(h, 500, 'error', error.message);
  }
};

const getBookById = (request, h) => {
  try {
    const { id } = request.params;
    const book = books.filter((b) => b.id === id)[0];

    if (book === undefined) {
      return errorHandling(h, 404, 'fail', 'Buku tidak ditemukan');
    }

    return h.response({
      status: 'success',
      data: { book },
    });
  } catch (error) {
    return errorHandling(h, 500, 'error', error.message);
  }
};

const editBookById = (request, h) => {
  try {
    const {
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
    } = request.payload;

    if (name === undefined) {
      return errorHandling(
        h,
        400,
        'fail',
        'Gagal memperbarui buku. Mohon isi nama buku',
      );
    }

    if (readPage > pageCount) {
      return errorHandling(
        h,
        400,
        'fail',
        'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
      );
    }

    const { id } = request.params;

    const bookIndex = books.findIndex((b) => b.id === id);
    if (bookIndex === -1) {
      return errorHandling(
        h,
        404,
        'fail',
        'Gagal memperbarui buku. Id tidak ditemukan',
      );
    }

    const finished = readPage === pageCount;
    const currentTimestamp = new Date().toISOString();

    const updatedBook = {
      ...books[bookIndex],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      finished,
      updatedAt: currentTimestamp,
    };

    books[bookIndex] = updatedBook;

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  } catch (error) {
    return errorHandling(h, 500, 'error', error.message);
  }
};

const deleteBookById = (request, h) => {
  try {
    const { id } = request.params;
    const bookIndex = books.findIndex((b) => b.id === id);
    if (bookIndex === -1) {
      return errorHandling(
        h,
        404,
        'fail',
        'Buku gagal dihapus. Id tidak ditemukan',
      );
    }

    books.splice(bookIndex, 1);

    return h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
  } catch (error) {
    return errorHandling(h, 500, 'error', error.message);
  }
};

module.exports = {
  addBook,
  getAllBooks,
  getBookById,
  editBookById,
  deleteBookById,
};
