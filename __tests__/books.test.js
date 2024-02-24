process.env.NODE_ENV = "test"

const request = require('supertest');


const app = require('../app');
const db = require('../db');

let book_isbn;

beforeEach(async function(){
    let result = await db.query(`INSERT INTO books
                                 (isbn, amazon_url, author, language, pages, publisher, title, year)
                                 VALUES('1111111111', 'http://test.com', 'test author', 'test language', 600, 'test publisher', 'test title', 2020)
                                 RETURNING isbn`);
    book_isbn = result.rows[0].isbn
});

describe('POST /books/', function(){
    test('Create new book', async function(){
        const response = await request(app).post('/books/')
            .send({
                isbn: '1234567890',
                amazon_url: 'http://other_test.com',
                author: 'other test author',
                language: 'other test language',
                pages: 200,
                publisher: 'other test publisher',
                title: 'other test title',
                year: 1990
            });
        expect(response.statusCode).toBe(201);
        expect(response.body.book).toHaveProperty('isbn');
    });

    test('Prevent book creation', async function(){
        const response = await request(app).post('/books/')
            .send({pages:5000});
        expect(response.statusCode).toBe(400);
    });
});

describe('PUT /books/:isbn', function(){
    test('Update book', async function(){
        const response = await request(app).put('/books/1111111111')
            .send({
                isbn: '1111111111',
                amazon_url: 'http://test.com',
                author: 'test author',
                language: 'test language',
                pages: 40000,
                publisher: 'test publisher',
                title: 'test title',
                year: 2022
            });
        expect(response.statusCode).toBe(200);
        expect(response.body.book.year).toBe(2022);
    });

    test('Prevent book update', async function(){
        const response = await request(app).put('/books/1111111111')
            .send({language: 'German'});
        expect(response.statusCode).toBe(400);
    });
});

afterEach(async function(){
    await db.query('DELETE FROM books');
});

afterAll(async function(){
    await db.end();
});