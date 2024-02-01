import { test, expect, vi } from 'vitest'
import { LudoMove, history, init, move, moves, on, piece, position, redo, turn, undo } from '.'
import { resetInit } from './helper';

test('Initilize instance.', () => {
    resetInit();
    const error = init()

    expect(error).toBe(undefined);
    expect(position()).toBe('abcd//abcd/ a aa')
    expect(turn()).toBe('a')
})

test('Initilize instance with custom position.', () => {
    resetInit();
    const error = init({ position: 'abud//abcd/ c aa' })

    expect(error).toBe(undefined);
    expect(position()).toBe('abud//abcd/ c aa')
    expect(turn()).toBe('c')
})

test('Get moves for a player.', () => {
    resetInit();
    const error = init({ position: 'abhd//abcd/ a aa' })
    expect(error).toBe(undefined);

    // We are using here `4` for custom distance.
    expect(moves(undefined, 4)).toEqual([
        {
            capture: [],
            from: { homeId: 0, index: 7, pieces: [{ index: 2, name: "a" }], type: "safe" },
            isInitial: false,
            isRepeat: false,
            number: 4,
            piece: { index: 2, name: "a" },
            to: { homeId: 0, index: 14, pieces: [], type: "safe-end" }
        }
    ])

    expect(moves(undefined, 3)).toEqual([
        {
            capture: [],
            from: { homeId: 0, index: 7, pieces: [{ index: 2, name: "a" }], type: "safe" },
            isInitial: false,
            isRepeat: false,
            number: 3,
            piece: { index: 2, name: "a" },
            to: { homeId: 0, index: 15, pieces: [], type: "safe-way" }
        }
    ])

    // we can directly get moves of perticular player.
    expect(moves('c', 6)).toHaveLength(4)

    // without 'options.canRound'.
    expect(moves(undefined, 6)).toHaveLength(4)

    // if player is unknown or distance is out of range.
    expect(moves('b', 3)).toBe("Unknown player name or 'distance' is out of range.")
    expect(moves(undefined, 8)).toBe("Unknown player name or 'distance' is out of range.")
})

test('Get moves for a player when using \'options.canRound\'.', () => {
    resetInit();
    const error = init({ position: 'abhd//abcd/ a aa', canRound: true })
    expect(error).toBe(undefined);

    // We are using here `4` for custom distance.
    expect(moves(undefined, 4)).toEqual([
        {
            capture: [],
            from: { homeId: 0, index: 7, pieces: [{ index: 2, name: "a" }], type: "safe" },
            isInitial: false,
            isRepeat: false,
            number: 4,
            piece: { index: 2, name: "a" },
            to: { homeId: 0, index: 14, pieces: [], type: "safe-end" }
        },
        {
            capture: [],
            from: { homeId: 0, index: 7, pieces: [{ index: 2, name: "a" }], type: "safe" },
            isInitial: false,
            isRepeat: true,
            number: 4,
            piece: { index: 2, name: "a" },
            to: { homeId: 0, index: 21, pieces: [], type: "right-way" }
        }
    ])
})

test('Move piece from one square to another.', () => {
    resetInit();
    const error = init({ position: 'aumd//abcd/ a aa' })
    expect(error).toBe(undefined);

    expect(turn()).toBe('a')

    // moves with random distance
    const _moves = moves(undefined, 4); // only 2nd piece can have moves of player 'a'.
    move(_moves[0] as LudoMove) // at 0th index, there will be second piece moves.

    // turn should be change -> p q r s t u
    expect(position()).toBe('aqmd//abcd/ c aa')

    // we can run player 'a' again if we want, just get moves by giving first parameter in 'moves()'.
    move(moves(undefined, 6)[0] as LudoMove) // at first index there will be first piece moves.
    expect(position()).toBe('aqmd//ubcd/ a aa')
})

test('Check history by using \'.undo()\' and \'.redo()\'.', () => {
    resetInit();
    const error = init({ position: 'aue3d//abcd/ a aa', historySize: 3 })
    expect(error).toBe(undefined);

    expect(turn()).toBe('a')
    expect(history()).toBe('')

    // we'll have two moves here, for 2nd and 3rd piece.
    move(moves(undefined, 1)[1] as LudoMove)
    expect(position()).toBe('auf3d//abcd/ c aa')
    expect(history()).toBe('a21')

    move(moves(undefined, 6)[3] as LudoMove)
    expect(position()).toBe('auf3d//abcu/ a aa')
    expect(history()).toBe('a21 c36~')

    move(moves(undefined, 1)[0] as LudoMove)
    expect(position()).toBe('atf3d//abcu/ c aa')
    expect(history()).toBe('a21 c36~ a11')

    move(moves(undefined, 6)[3] as LudoMove)
    expect(position()).toBe('atcd//abcf3/ a ab')
    expect(history()).toBe('c36~ a11 c36.a2') // (a21 c36~ a11 c36.a2) history size is just 3

    // let undo two times
    undo();
    expect(position()).toBe('atf3d//abcu/ c aa')
    expect(history()).toBe('c36~ a11')

    undo();
    expect(position()).toBe('auf3d//abcu/ a aa')
    expect(history()).toBe('c36~')

    redo();
    expect(position()).toBe('atf3d//abcu/ c aa')
    expect(history()).toBe('c36~ a11')

    // we have one more 'redo', but we are discarding it.
    move(moves(undefined, 1)[0] as LudoMove)
    expect(position()).toBe('atf3d//abct/ a aa')
    expect(history()).toBe('c36~ a11 c31')

    // no more redo, beacuas we already override the move.
    expect(redo()).toBe("No more redo.")

    undo();
    expect(position()).toBe('atf3d//abcu/ c aa')
    expect(history()).toBe('c36~ a11')
})

test('Check listeners.', () => {
    const fnObj = {
        add: (..._v: any[]) => { },
        capture: (..._v: any[]) => { },
        finish: (..._v: any[]) => { },
        move: (..._v: any[]) => { },
        init: (..._v: any[]) => { },
        turn: (..._v: any[]) => { },
        over: (..._v: any[]) => { }
    }

    const addFn = vi.spyOn(fnObj, 'add');
    const finishFn = vi.spyOn(fnObj, 'finish');
    const moveFn = vi.spyOn(fnObj, 'move');
    const initFn = vi.spyOn(fnObj, 'init');
    const turnFn = vi.spyOn(fnObj, 'turn');
    const overFn = vi.spyOn(fnObj, 'over');

    // listeners must be added before inilizing the instance.
    on('add', (...args) => fnObj.add(...args))
    on('finish', (...args) => fnObj.finish(...args))
    on('init', (...args) => fnObj.init(...args))
    on('move', (...args) => fnObj.move(...args))
    on('over', (...args) => fnObj.over(...args))
    on('turn', (...args) => fnObj.turn(...args))

    resetInit();
    const error = init({ position: 'efgh//efgh/ a aa' })
    expect(error).toBe(undefined);

    // this function will be called 8th times, { index, name, homeId, position }
    expect(addFn).toBeCalledTimes(8)

    expect(initFn).toBeCalledTimes(1)
    expect(turnFn).toBeCalledWith('a')

    move(moves(undefined, 6)[0] as LudoMove)
    expect(turnFn).toBeCalledWith('c')

    expect(moveFn).toBeCalledWith(
        { index: 0, name: 'a' },
        { type: 'normal', homeId: 0, index: 4, pieces: [{ index: 0, name: 'a' }] },
        { type: 'safe-way', homeId: 0, index: 15, pieces: [] },
        'move'
    )

    // let change board position for capturing
    // let's make it easy by taking only two players
    resetInit();
    expect(init({ position: 'wwwk/wwwm/wwwl a aa', canRound: false })).toBe(undefined)
    expect(initFn).toBeCalledTimes(2)
    expect(turnFn).toBeCalledWith('a')

    move(moves(undefined, 1)[0] as LudoMove)
    expect(turnFn).toBeCalledWith('b')
    expect(finishFn).toBeCalledWith({ name: 'a', index: 3 })

    move(moves(undefined, 2)[0] as LudoMove)
    expect(turnFn).toBeCalledWith('c')
    expect(piece(10, 1)!.pieces[0]).toEqual({ name: 'b', index: 3 })

    move(moves(undefined, 2)[0] as LudoMove)
    expect(turnFn).toBeCalledWith('a')
    expect(finishFn).toBeCalledWith({ name: 'c', index: 3 })
    expect(overFn).toBeCalledWith(['a', 'c'], 'b')
})

test('Piece must not enter in \'safe-end\', if not made any capture.', () => {
    resetInit();
    const error = init({ position: 'fijp//abcg0/ a aa', historySize: 0, capture: true, canRound: false })
    expect(error).toBe(undefined);

    expect(turn()).toBe('a');
    const _moves = moves(undefined, 1) as LudoMove[];
    _moves.forEach(element => {
        expect(element.to.index > 14 || element.to.index < 10).toBe(true)
    });

    move(_moves[0])
    expect(position()).toBe('gijp//abcd/ c ba')

    move(moves(undefined, 6)[0] as LudoMove);
    expect(position()).toBe('gijp//ubcd/ a ba');

    const to = (moves(undefined, 1) as LudoMove[])[2].to.index;
    expect(to < 15 || to > 9).toBe(true)
})