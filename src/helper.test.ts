import { test, expect } from 'vitest'
import { init, next, piece, prev, square } from '.'
import { resetInit } from './helper';

// Initilize ludo instance
resetInit();
init({ position: 'abud//abvd/ a aa' });

test('Checking \'.square()\' function.', () => {
    expect(square('a', 2)).toEqual({
        type: 'safe',
        index: 20,
        homeId: 0,
        pieces: [
            { name: 'a', index: 2 }
        ]
    })

    expect(square('b', 2)).toEqual(null)

    expect(square('c', 2)).toEqual({
        type: 'right-way',
        index: 21,
        homeId: 2,
        pieces: [
            { name: 'c', index: 2 }
        ]
    })

    expect(square('c', 0)).toEqual({
        type: 'home',
        index: 0,
        homeId: 2,
        pieces: [
            { name: 'c', index: 0 }
        ]
    })
})

test('Checking \'.piece()\' function wihout second parameter.', () => {
    expect(piece(0)).toEqual({
        type: 'home',
        index: 0,
        homeId: -1,
        pieces: [
            { name: 'a', homeId: 0, index: 0 },
            { name: 'c', homeId: 2, index: 0 }
        ]
    })
    expect(piece(21)).toEqual({
        type: 'right-way',
        index: 21,
        homeId: -1,
        pieces: [
            { name: 'c', homeId: 2, index: 2 }
        ]
    })
    expect(piece(20)).toEqual({
        type: 'safe',
        index: 20,
        homeId: -1,
        pieces: [
            { name: 'a', homeId: 0, index: 2 }
        ]
    })
})

test('Checking \'.piece()\' function with second parameter.', () => {
    expect(piece(0, 0)).toEqual({
        type: 'home',
        index: 0,
        homeId: 0,
        pieces: [
            { name: 'a', index: 0 }
        ]
    })
    expect(piece(0, 2)).toEqual({
        type: 'home',
        index: 0,
        homeId: 2,
        pieces: [
            { name: 'c', index: 0 }
        ]
    })
})

test('Checking \'.next()\' function.', () => {
    expect(next(0, 0)).toEqual({
        type: 'safe',
        index: 20,
        homeId: 0,
        pieces: [
            { name: 'a', index: 2 }
        ]
    })

    // we can not go next after '22', it is the last index.
    expect(next(22, 0)).toEqual({
        type: 'goal',
        index: 22,
        homeId: 0,
        pieces: []
    })

    expect(next(3, 0)).toEqual({
        type: 'safe',
        index: 20,
        homeId: 0,
        pieces: [
            { name: 'a', index: 2 }
        ]
    })

    expect(next(16, 0)).toEqual({
        type: 'normal',
        index: 4,
        homeId: 1,
        pieces: []
    })

    expect(next(10, 0)).toEqual({
        type: 'goal',
        index: 22,
        homeId: 0,
        pieces: []
    })

    // without knowing homeId it should go to next square.
    expect(next(15, 0)).toEqual({
        type: 'right-way',
        index: 21,
        homeId: 0,
        pieces: []
    })

    // with homeId it should check for 'safe-end'.
    expect(next(15, 0, 0)).toEqual({
        type: 'safe-end',
        index: 14,
        homeId: 0,
        pieces: []
    })
})

test('Checking \'.prev()\' function.', () => {
    expect(prev(20, 0, 1, 0)).toEqual({
        type: 'home',
        index: 1,
        homeId: 0,
        pieces: [
            { name: 'a', index: 1 }
        ]
    })

    expect(prev(3, 0, 1, 0)).toEqual({
        type: 'home',
        index: 1,
        homeId: 0,
        pieces: [
            { name: 'a', index: 1 }
        ]
    })

    expect(prev(20, 0, 1)).toEqual({
        type: 'right-way',
        index: 21,
        homeId: 0,
        pieces: []
    })

    expect(prev(4, 0, 1)).toEqual({
        type: 'left-way',
        index: 16,
        homeId: 3,
        pieces: []
    })

    expect(prev(22, 0, 1)).toEqual({
        type: 'safe-end',
        index: 10,
        homeId: 0,
        pieces: []
    })
})