import { LudoEvent, LudoPiece, LudoSquare } from "./types";
import { BOARD, CAPTURED, CONFIG, EVENTS, GAME_INFO, HISTORY, LENGTH, PIECES, PLAYERS, PLAYERS_WITH_ENDS } from "./store";

/**
 * Convert `a-w` characters into `0-22` numbers.
 */
export const codeFromChar = (string: string, delimeter = 0) => {
    return string.charCodeAt(delimeter) - 97
}

/**
 * Convert `0-22` numbers into `a-w` characters.
 */
export const charFromCode = (code: number) => {
    return String.fromCharCode(code + 96)
}

/**
 * Add listener that'll trigger when same event occur.
 */
export const addListener = <E extends keyof LudoEvent>(
    event: E,
    handler: LudoEvent[E]
): void => {
    EVENTS[event] = handler;
}

/**
 * Trigger event, so registered listeners can listen up.
 */
export const callListener = <E extends keyof LudoEvent>(
    event: E,
    ...args: any[]
): void => {
    // @ts-ignore
    EVENTS[event]?.(...args)
}

/**
 * Get Square information by `squareIndex` and `homeId`
 */
export const pieceAt = (
    squareIndex: number,
    homeId = -1
): null | LudoSquare => {
    if (squareIndex < 0 || squareIndex > 22 || (homeId != -1 && homeId >= GAME_INFO[2])) {
        return null;
    }

    const square = BOARD[squareIndex],
        pieces: Omit<LudoPiece, "position" | 'homeId'>[] = [];

    for (const piece in square.pieces) {
        const pieceHomeId = square.pieces[piece];
        if (homeId < 0 || homeId == pieceHomeId) {
            pieces.push({
                name: piece[0],
                index: +piece[1],
                ...(homeId >= 0 ? {} : { homeId: pieceHomeId })
            })
        }
    }

    return {
        ...square,
        homeId: homeId,
        index: squareIndex,
        pieces: pieces
    }
}

/**
 * Find square infomation by using `pieceName` and `index`.
 */
export const squareOf = (pieceName: string, index: number) => {
    if (!PIECES[pieceName] || index < 0 || index > 3) {
        return null
    }

    const squareIndex = PIECES[pieceName][index],
        square = BOARD[squareIndex];

    return pieceAt(squareIndex, square.pieces[pieceName + index])
}

/**
 * Get next `square index` and `homeId`.
 */
export const nextSquareIndex = (
    squareIndex: number,
    homeId: number,
    ownHomeId: number
): [squareIndex: number, homeId: number] => {
    return [
        (squareIndex == 10 || squareIndex == 22)
            ? 22 : squareIndex == 16
                ? 4 : squareIndex == 9
                    ? 15 : squareIndex < 4
                        ? 20 : (ownHomeId != homeId && squareIndex == 15)
                            ? 21 : squareIndex < 10 ? squareIndex + 1 : squareIndex - 1,
        squareIndex == 16 ? (homeId + 1 == GAME_INFO[2]) ? 0 : homeId + 1 : homeId
    ]
}

/**
 * Get prev `square index` and `homeId`.
 */
export const prevSquareIndex = (
    squareIndex: number,
    homeId: number,
    ownHomeId: number,
    pieceIndex: number
): [squareIndex: number, homeId: number] => {
    return [
        squareIndex == 22
            ? 10 : squareIndex == 15
                ? 9 : squareIndex == 21
                    ? 15 : squareIndex == 4
                        ? 16 : ((squareIndex == 20 || squareIndex < 4) && ownHomeId == homeId)
                            ? pieceIndex : squareIndex < 10
                                ? squareIndex - 1 : squareIndex + 1,
        squareIndex == 4 ? homeId == 0 ? GAME_INFO[2] - 1 : homeId - 1 : homeId
    ]
}

/**
 * Find next square infomation by using current `squareIndex` and `homeId`.
 */
export const nextSquare = (squareIndex: number, homeId: number, findBy = -1) => {
    return pieceAt(...nextSquareIndex(squareIndex, homeId, findBy));
}

/**
 * Find previous square infomation by using current `squareIndex` and `homeId`.
 */
export const prevSquare = (squareIndex: number, homeId: number, defaultIndex: number, findBy = -1) => {
    return pieceAt(...prevSquareIndex(squareIndex, homeId, findBy, defaultIndex));
}

/**
 * Check current player.
 */
export const turn = (): string => {
    return PLAYERS[GAME_INFO[0]];
}

/**
 * Regex for history info
 */
export const getHistoryInfo = (history: string) => {
    return /(\w)(\d)(\d)(\.(\w)(\d+))?(~|-)?/.exec(history)
}

/**
 * Move piece helper function.
 */
export const moveHelper = (
    piece: string,
    index: number,
    fromIndex: number,
    fromHomeId: number,
    toIndex: number,
    toHomeId: number,
    type: 'move' | 'undo-move' | 'capture' | 'undo-capture'
) => {
    const from = pieceAt(fromIndex, fromHomeId);
    const to = pieceAt(toIndex, toHomeId);

    delete BOARD[fromIndex].pieces[piece + index];
    BOARD[toIndex].pieces[piece + index] = toHomeId;
    PIECES[piece][index] = toIndex;
    callListener('move', { name: piece, index: index }, from, to, type)
}

/**
 * @internal reset previous initialization.
 */
export const resetInit = () => {
    Object.keys(PIECES).map(key => (delete PIECES[key]))
    Object.keys(CAPTURED).map(key => (delete CAPTURED[key]))
    GAME_INFO[1] = PLAYERS[LENGTH] = PLAYERS_WITH_ENDS[LENGTH] = HISTORY[LENGTH] = 0;

    BOARD.forEach((_, index) => BOARD[index] = ({
        pieces: {},
        type: index == 22
            ? 'goal' : (index == 20 || index == 7)
                ? 'safe' : (index > 9 && index < 15)
                    ? 'safe-end' : index == 15
                        ? 'safe-way' : index < 4
                            ? 'home' : index == 16
                                ? "left-way" : (index == 21 || index == 9)
                                    ? 'right-way' : 'normal'
    }))

    Object.assign(CONFIG, {
        openWith: [6],
        canRound: false,
        capture: false,

        // a-w -> squareIndex, 0-9 -> homeId
        position: 'abcd//abcd/ a aa',
        state: '',
        historySize: 0
    })
}