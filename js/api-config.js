/**
 * Autor: lcnato - BV 3044297
 * data implementação: 15 / 06 / 2025
 * API_config.js é um javaScript Global usado para o Autores e Livros, e 
 * adiciona o path das Requisições HTTP para a API REST.
 * 
 */ 

const API_BASE_URL = 'http://localhost:8080';
const API_URN_AUTOR = '/autores';
const API_URN_LIVRO = '/livros';
const API_URI_AUTOR = API_BASE_URL + API_URN_AUTOR;
const API_URI_LIVRO = API_BASE_URL + API_URN_LIVRO;