import { LudoOptions, LudoMove, LudoPiece, LudoSquare } from "./types";
import { BOARD, GAME_INFO, PIECES, CONFIG, RANDOM_NUMS, PLAYERS, HISTORY, PLAYERS_WITH_ENDS, LENGTH, CAPTURED } from "./store";
import { callListener, charFromCode, codeFromChar, getHistoryInfo, moveHelper, nextSquareIndex, pieceAt, prevSquareIndex, } from "./helper";

/**
 * Initilize ludo game.
 */
export const initGame = (options: LudoOptions = {}) => {
    Object.assign(CONFIG, options)
    if (options.state) {
        HISTORY.push(...options.state.split(' '))
    }

    const positionType = CONFIG.position!.split(' ');
    if (positionType[LENGTH] != 3) {
        return 'Invalid \'options.position\' given in \'.init()\'.'
    }

    const piecePositions = positionType[0].split("/");
    let positions = '', homeCount = 0, pieceCount = 0, charCode: number,
        index = 0, currentChar = '', currentHomeId = '';

    for (positions of piecePositions) {
        homeCount++;
        if (!positions) {
            continue;
        }

        if ((currentChar = charFromCode(homeCount)) == positionType[1]) {
            GAME_INFO[0] = PLAYERS[LENGTH];
        }

        PIECES[currentChar] = [0, 1, 2, 3];
        CAPTURED[currentChar] = 0;
        pieceCount = index = 0;

        while (positions[index]) {

            if (positions[index] < 'a' || positions[index] > 'w') {
                return `Invalid piece position at '${positions[index]}'.`
            }

            if (pieceCount == 4) {
                return `Player '${currentChar}' has more than 4 pieces.`
            }

            PIECES[currentChar][pieceCount] = charCode = codeFromChar(positions, index);
            if ((currentHomeId = positions[index + 1]) >= '0' && currentHomeId <= '9') {
                index++;
            } else {
                currentHomeId = (homeCount - 1) + '';
            }

            BOARD[charCode].pieces[currentChar + pieceCount] = +currentHomeId;
            index++;

            callListener('add', {
                index: pieceCount++,
                name: currentChar,
                homeId: +currentHomeId,
                position: charCode
            } as LudoPiece)
        }

        if (PIECES[currentChar].every(index => index == 22)) {
            PLAYERS_WITH_ENDS.push(currentChar)
        } else {
            PLAYERS.push(currentChar)
        }
    }

    index = 0;
    while (currentChar = positionType[2][index]) {
        CAPTURED[charFromCode(++index)] = codeFromChar(currentChar);
    }

    GAME_INFO[2] = homeCount;
    if (!PLAYERS[GAME_INFO[0]]) {
        return "Unknown player turn.";
    }

    callListener('init');
    callListener('turn', PLAYERS[GAME_INFO[0]])
}

/**
 * Get moves of current player.
 */
export const getMoves = (piece?: string, distance = 0) => {
    if (!PIECES[piece ||= PLAYERS[GAME_INFO[0]]] || distance > 6 || distance < 0) {
        return 'Unknown player name or \'distance\' is out of range.';
    }

    distance ||= RANDOM_NUMS[Math.floor(Math.random() * 8)];

    const player = PIECES[piece], pieceHomeId = codeFromChar(piece),
        moves: LudoMove[] = [];

    let index = 0, isRepeat = false, pieceIndex: number, homeId: number,
        totalDistance: number, toIndex: number = 0, toHomeId: number = 0;
    while (index < 4) {
        pieceIndex = player[index], totalDistance = pieceIndex < 4 ? 1 : distance;
        homeId = BOARD[pieceIndex].pieces[piece + index], toIndex = pieceIndex, toHomeId = homeId;

        if (
            // piece should not be in `goal` square
            pieceIndex != 22 &&

            // if it is inside `safe-end` and then check if we can move or not.
            (pieceIndex > 14 || pieceIndex < 10 || pieceIndex - distance > 8) &&

            // it should be opened using spcified numbers (such as 6), if it is in `home` square.
            (pieceIndex > 3 || CONFIG.openWith!.includes(distance))
        ) {
            while (totalDistance-- > 0) {
                [toIndex, toHomeId] = nextSquareIndex(toIndex, toHomeId, (isRepeat ? -1 : pieceHomeId));
            }

            // does it need a capture
            if (!(toIndex < 15 && toIndex > 9) || !CONFIG.capture || CAPTURED[piece]) {
                const nextSquare = pieceAt(toIndex, toHomeId);
                moves.push({
                    capture: nextSquare!.pieces.filter(p => p.name != piece),
                    from: pieceAt(pieceIndex, homeId) as LudoSquare,
                    to: nextSquare as LudoSquare,
                    isInitial: pieceIndex < 4,
                    isRepeat: isRepeat,
                    number: distance,
                    piece: { name: piece, index: index }
                })
            }

            if (isRepeat = (CONFIG.canRound as boolean && !isRepeat && (toIndex > 9 && toIndex < 15))) {
                index--;
            }
        }
        index++;
    }

    return moves
}

/**
 * Move piece in board from one position to another.
 */
export const movePiece = (move: LudoMove) => {
    const { from, to, piece } = move;
    const lastSquare = pieceAt(to.index, to.homeId);
    const capturedPieces = lastSquare!.type == 'safe' ? [] :
        lastSquare!.pieces.filter(p => piece.name != p.name);

    if (!lastSquare || PLAYERS[LENGTH] == 1) {
        return 'Invalid move or game is already over.';
    }

    // Is History option enabled
    if (CONFIG.historySize) {
        const MOVE_INFO = (piece.name + piece.index + move.number)
            // @ts-ignore
            + (capturedPieces[LENGTH] ? ('.' + capturedPieces![0].name + capturedPieces.map(piece => piece.index)) : '')
            + (move.isInitial ? '~' : move.isRepeat ? '-' : '');

        // override previous move
        if (GAME_INFO[1] < HISTORY[LENGTH]) {
            HISTORY[LENGTH] = GAME_INFO[1];
        }

        HISTORY.push(MOVE_INFO);
        if (CONFIG.historySize < HISTORY[LENGTH]) {
            HISTORY.shift();
        } else {
            GAME_INFO[1]++;
        }
    }

    // Can we capture any piece
    if (capturedPieces[LENGTH]) {
        const pieceHomeId = codeFromChar(capturedPieces[0].name);
        capturedPieces.forEach(p => {
            CAPTURED[piece.name]++;
            moveHelper(p.name, p.index, to.index, to.homeId, p.index, pieceHomeId, 'capture');
        })
    }

    // move piece
    moveHelper(piece.name, piece.index, from.index, from.homeId, to.index, to.homeId, 'move');

    if (to.index == 22) {
        callListener('finish', piece)
        if (PIECES[piece.name].every(index => index == 22)) {
            PLAYERS_WITH_ENDS.push(piece.name);
            PLAYERS.splice(GAME_INFO[0], 1);
            GAME_INFO[0]--;
        }
    }

    // check if game is over ?
    if (PLAYERS[LENGTH] == 1) {
        callListener('over', [...PLAYERS_WITH_ENDS], PLAYERS[0]);
    }

    // change turn
    callListener('turn', PLAYERS[GAME_INFO[0] = ++GAME_INFO[0] == PLAYERS[LENGTH] ? 0 : GAME_INFO[0]])
}

/**-
 * Undo Last move
 */
export const undoMove = () => {
    if (GAME_INFO[1] == 0) {
        return 'No more undo.';
    }

    const [, piece, index, distance, , capture, captureIndex, moveType] = getHistoryInfo(HISTORY[--GAME_INFO[1]])!;
    const currentIndex = PIECES[piece][+index], currentHomeId = BOARD[currentIndex].pieces[piece + index];
    let toIndex = currentIndex, distanceCovered = moveType == '~' ? 1 : +distance,
        toHomeId = currentHomeId, isLastIndex = currentIndex == 22;

    while (distanceCovered-- > 0) {
        [toIndex, toHomeId] = prevSquareIndex(
            toIndex,
            toHomeId,
            moveType == '~' ? toHomeId : -1,
            +index
        )

        if (toIndex < 4 && distanceCovered) {
            return 'Invalid history move.';
        }
    }

    // undo piece move
    moveHelper(piece, +index, currentIndex, currentHomeId, toIndex, toHomeId, 'undo-move')

    if (capture) {
        captureIndex.split('').forEach((index) => {
            // undo captured piece
            moveHelper(capture, +index, +index, codeFromChar(piece), currentIndex, currentHomeId, 'undo-capture')
            CAPTURED[piece] = CAPTURED[piece] ? CAPTURED[piece] - 1 : 0;
        })
    }

    if (isLastIndex) {
        const index = PLAYERS_WITH_ENDS.findIndex(player => player == piece);
        if (index != -1) {
            PLAYERS_WITH_ENDS.splice(index, 1);
            PLAYERS.push(piece);
            PLAYERS.sort();
        }
    }

    callListener('turn', PLAYERS[GAME_INFO[0] = --GAME_INFO[0] == -1 ? PLAYERS[LENGTH] - 1 : GAME_INFO[0]])
}

/**
 * Redo move.
 */
export const redoMove = () => {
    if (GAME_INFO[1] == HISTORY[LENGTH]) {
        return 'No more redo.';
    }

    const [, piece, index, distance, , , , moveType] = getHistoryInfo(HISTORY[GAME_INFO[1]])!;
    const currentIndex = PIECES[piece][+index];
    const currentHomeId = BOARD[currentIndex].pieces[piece + index];


    let toIndex = currentIndex, distanceCovered = moveType == '~' ? 1 : +distance,
        toHomeId = currentHomeId;

    while (distanceCovered-- > 0) {
        [toIndex, toHomeId] = nextSquareIndex(
            toIndex,
            toHomeId,
            moveType ? -1 : toHomeId
        )

        if (toIndex == 22 && distanceCovered) {
            return 'Invalid history move.';
        }
    }

    movePiece({
        from: {
            homeId: currentHomeId,
            index: currentIndex
        },
        number: +distance,
        piece: { index: +index, name: piece },
        to: {
            homeId: toHomeId,
            index: toIndex
        }
    } as LudoMove)
}

/**
 * Get history of game
 * @returns 
 */
export const getState = () => {
    return HISTORY.slice(0, GAME_INFO[1]).join(" ");
}

/**
 * Get a string that represent the position of pieces.
 */
export const getPosition = () => {
    const pieceOrder: string[] = Array(GAME_INFO[2]);
    Object.keys(PIECES).forEach(piece => {
        pieceOrder[codeFromChar(piece)] = piece;
    })

    return [
        pieceOrder.map((piece, _index): string => {
            return piece ? PIECES[piece].map((num, index) => {
                const homeId = BOARD[num].pieces[charFromCode(_index + 1) + index];
                return charFromCode(num + 1) + (homeId == _index ? '' : homeId)
            }).join('') : '';
        }).join('/'),
        PLAYERS[GAME_INFO[0]],
        pieceOrder.map(piece => charFromCode(CAPTURED[piece] > 25 ? 26 : CAPTURED[piece] + 1)).join('')
    ].join(' ');
}