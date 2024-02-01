import {
    LudoBoard,
    LudoPiecePosition,
    LudoEvent,
    LudoOptions,
    History
} from "./types"

// 😁 for making code smaller only.
export const LENGTH = 'length';

/**
 * Denotes player turn and number of homes
 */
export type GameInfo = [
    turn: number, // current turn `a-w`
    undoPosition: number,
    home: number // number of homes in board
]

export const GAME_INFO: GameInfo = [0, 0, 0]

/**
 * Denotes game events holder.
 */
export const EVENTS: LudoEvent = {}

/**
 * Denotes Ludo pieces 
 */
export const PIECES: LudoPiecePosition = {}

/**
 * Denotes which player makes a capture.
 */
export const CAPTURED: Record<string, number> = {}

/**
 * Denoted the board
 */
export const BOARD: LudoBoard = Array(23).fill(null).map((_, index) => ({
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

/**
 * Denoted config of game
 */
export const CONFIG: LudoOptions = {
    openWith: [6],
    canRound: false,
    capture: false,

    // a-w -> squareIndex, 0-9 -> homeId
    position: 'abcd//abcd/ a aa',
    state: '',
    historySize: 0
}

/**
 * For generating random number between 1-6.  
 * Here periority of 1 and 6 is more than other numbers.
 */
export const RANDOM_NUMS = [1, 2, 3, 6, 1, 4, 5, 6];

/**
 * Hold moves history
 */
export const HISTORY: History = []

/**
 * Hold Total players names (a-g)
 */
export const PLAYERS: string[] = []

/**
 * Hold players who finished their game (a-g).
 */
export const PLAYERS_WITH_ENDS: string[] = []