/**
 * Square type in the board =>
 * __`safe`__: Safe position where nobody can capture.
 * __`home`__: Home squares of each player (from 0 to 3).
 * __`goal`__: It is the last square of game (22).
 * __`safe-end`__: These are the squares of perticular players (from 14 to 10).
 * __`safe-way`__: After this square `safe-end` squares'll be there for perticular player (15).
 * __`left-way`__: Normal square, But next square will be on left side (16).
 * __`right-way`__: Normal square, But next square will be on right side (9 and 21).
 * __`normal`__: Normal square, Anyone can capture here.
 */
export type SquareType = 'safe' | 'home' | 'goal' | 'safe-end'
    | 'safe-way' | 'left-way' | 'right-way' | 'normal';

/**
 * Represent Ludo options.
 * __`openWith`__: numbers which'll be used to open a piece **deafult: [6]**.
 * __`state`__: a string formate, will be used for game state, piece position, comments and other informations. **deafult: undefined**
 * __`canRound`__: can a piece start the journey again, instead of going to 'safe-end' **deafult: 0**.
 * __`capture`__: does a piece need atleast do one capture for going to 'safe-end' **deafult: false**.
 * __`position`__: a string formate, will be used to piece positions **deafult: rrrr//gggg/ r*.
 */
export interface LudoOptions {
    openWith?: number[],
    state?: string,
    canRound?: boolean,
    capture?: boolean,
    position?: string,
    historySize?: number
}

/**
 * Represent Ludo Piece.
 * __`name`__: pieces name.
 * __`index`__: piece index ex. 0 - 3.
 * __`position`__: piece position in the board ex. 0 - 17.
 * __`homeId`__: Current location (A unique homeId)
 */
export interface LudoPiece {
    name: string,
    index: number,
    position?: number,
    homeId?: number
}

/**
 * Represent LudoBoard Square.
 * __`type`__: Square type.
 * __`index`__: square index in the board.
 * __`pieces`__: pieces that are in current square.
 * __`homeId`__: A unique id, generally represent the number of home.
 */
export interface LudoSquare {
    type: SquareType,
    index: number,
    pieces: LudoPiece[],
    homeId: number
}

/**
 * Move types
 */
export type MoveType = 'undo-move' | 'undo-capture' | 'move' | 'capture';

/**
 * Represent LudoPiece move.
 * - __`isInitial`__: `true` if this is initial move of a piece otherwise `false`.
 * - __`number`__: Numbers from `0` to `6`.
 * - __`from`__: Square information of first square.
 * - __`to`__: Square information of last square.
 * - __`capture`__: Array of pieces which can be captured.
 * - __`isRepeat`__: `true` 
 */
export interface LudoMove {
    isInitial: boolean,
    number: number,
    from: LudoSquare,
    to: LudoSquare,
    capture: LudoPiece[],
    isRepeat: boolean,
    piece: LudoPiece
}

/**
 * Represent Ludo events.
 * - __`add`__: Whenever any piece'll be added to the board
 * - __`init`__: Whenever the `.init()` method'll be called
 * - __`over`__:  When the game over
 * - __`finish`__: Whenever any player finish the game
 * - __`move`__: Whenever a piece move in the board
 * - __`turn`__: Whenever turn change.
 */
export interface LudoEvent {
    add?: (piece: LudoPiece) => void,
    init?: () => void,
    over?: (pieces: string[], lastPlayer: string) => void,
    finish?: (piece: LudoPiece) => void,
    move?: (piece: LudoPiece, from: LudoSquare, to: LudoSquare, type: MoveType) => void,
    turn?: (piece: string) => void
}

/**
 * Represent Piece position.
 * - __[piece]__: pieces name
 */
export type LudoPiecePosition = Record<string, [
    firstPiece: number,
    secondPiece: number,
    thirdPiece: number,
    fourthPiece: number,
]>
/**
 * Represent ludo board squares.
 */

interface BoardSquare {
    type: SquareType,
    pieces: Record<string, number>
}

export type LudoBoard = BoardSquare[]

/**
 * Represent history of moves
 */
export type History = string[]