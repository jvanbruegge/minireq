import { makeRequest } from '../src/index';

export const db = require('./support/data.json');

export const url = (path: string) => 'http://localhost:3000' + path;

export const resetDB = () =>
    makeRequest()({
        method: 'POST',
        url: url('/api/reset')
    }).promise;
