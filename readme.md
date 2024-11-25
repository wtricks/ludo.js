# Ludo JS

**Ludo.js** is a powerful JavaScript library designed for implementing the classic board game. It offers a comprehensive set of features for generating and validating Ludo game moves. This library, although excluding GUI components, provides a simple and flexible API for creating and managing Ludo game instances.

## Table of Contents

- [Understanding structure](#understanding-structure)
- [Key features](#features)
- [Installation](#installation)
- [Usage](#usage)

### Understanding Structure

Before delving into the library's functionalities, it's essential to grasp the underlying structure, including the board layout and square categories. The game board consists of 23 squares, each with a designated index and categorized as 'home,' 'safe,' 'safe-end,' 'safe-way,' 'goal,' 'left-way,' 'right-way,' or 'normal.' Refer to the visual representation for a clear understanding.

__Below is design of a Home of the board__
```md
# Design of one's player Home.

               -----------
              |    GAME   |
              |    <22>   |
              |    OVER   |
               -----------
              |16 | 10| 4 |
               -----------
              | 17|11 | 5 |
               -----------
              |18 | 12| 6 |
               -----------
    HOME      | 19|13 | # |
  -----------  -----------
 |  0  |  1 | | # | 14| 8 |
  -----------  -----------
 |  2  |  3 | | 21|15 | 9 |
  -----------  -----------
```
In the above structure, we have total 23 squares (22th square will be shared by all players). Each square has its own index that is denoted by 0 to 22 (or a-w) indices I have divided these squares into seven category (`home`, `safe`, `safe-end`, `safe-way`, `goal`, `left-way`, `right-way`, `normal`). First 4 squares (0 to 3) are `home` squares, square 7 and 20 are `safe` squares, squares from 10 to 14 are `safe-end` squares, square 15 is `safe-way` square, square 22 which is last square, is the `goal` square, square 16 is `left-way` square, squares 9 and 21 are `right-way` squares and remaining are `normal` squares.


### Key features

- __Multiplayer Support:__ Ludo.js can handle up to 9 players, offering a dynamic gaming experience. A minimum of 2 players is required to start a game.

- __State Management:__ The library enables the loading and saving of game positions and histories, allowing players to resume or review games.

- __Undo and Redo:__ Players can undo and redo their moves, providing flexibility and strategic exploration during the game.

### Installation

Install Ludo.js using package managers.

```bash
# using pnpm
pnpm add @nanowiz/ludo.js

# or using npm
npm install @nanowiz/ludo.js
```
```ts
// esm import
import * as LudoJs from '@nanowiz/ludo.js'

// commonjs
const LudoJs = require('@nanowiz/ludo.js')
```

Or utilize the CDN for quick integration.

```html
<script src="https://cdn.jsdelivr.net/npm/@nanowiz/ludo.js/dist/ludo.js"></script>

<!-- or esm module -->
<script type="module">
  import * as LudoJs from 'https://cdn.jsdelivr.net/npm/@nanowiz/ludo.js/dist/ludo.mjs'
</script>
```

### Usage

- [Creating instance](#creating-instance)
- [.init()](#init)
- [.turn()](#turn)
- [.piece()](#piece)
- [.square()](#square)
- [.next()](#next)
- [.prev()](#prev)
- [.on()](#on)
- [.moves()](#move)
- [.move()](#moves)
- [.position()](#position)
- [.history()](#history)
- [.undo()](#undo)
- [.redo()](#redo)


#### Creating instance
```ts
// create a instance of LudoJs
const ludo = LudoJs()

// or create instance and destruct methods
const {
    init,
    turn,
    piece,
    square,
    next,
    prev,
    position,
    history,
    undo,
    redo,
    on,
    move,
    moves
} = LudoJs();
```

#### .init()

```ts
function init({
    openWith: [6],
    state: '', 
    capture: false,
    canRound: false,
    position: 'abcd//abcd/ a aa',
    historySize: 0 
}): void
```
After creating ludo instance, this is the first method that we need to call. It accept an object as its first parameter with all optional properties.

- __openWith__: This is an array of numbers from 1 to 6. These numbers'll use to in initial move of every piece. Defualt value is `[6]`.

- __state__: History of moves in string formate, Default value is `''`.

- __capture__: If this option is enabled then a player can not enter in `safe-end` squares without making a capture. Default value is `false`.

- __canRound__: This option is helpful when `capture` option is enabled, this option enables user to round again around the 'homes' for capturing any piece.

- __position__: With this option, you can pass custom position of pieces and number of players in the board This is a simple string formate. Default value is `abcd//abcd/ a aa`.

```
  abcd//abcd/ a aa
  ----------- - --
     |        |  |- number of captures made by specific player
  position    |
              |- turn
```

- __historySize__: Number of moves that can be store in history. Default value is `0`.

#### .turn()

```ts
console.log(turn()) // a
```

Check which has the current turn. It returs an alphabet denoting the player name.

#### .piece()

```ts
function piece(squareIndex: number, homeId = -1): null | LudoSquare
```
This method returns the information of a specified square in the board, If `squareIndex` and `homeId` is valid. You can omit the second parameter to get all pieces information on specified `squareIndex` (beacuse every player's home has same squares, ex. 0-22, but different homeId).

```ts
// without second parameter
console.log(piece(0))
// {
//     type: 'home',
//     index: 0,
//     homeId: -1,
//     pieces: [
//         { name: 'a', index: 0, homeId: 0 },
//         { name: 'c', index: 0, homeId: 2 }
//     ]
// }

// with second parameter
console.log(piece(0, 0))
// {
//     type: 'home',
//     index: 0,
//     homeId: 0,
//     pieces: [
//         { name: 'a', index: 0 }
//     ]
// }
```

#### .square()

```ts
function square(piece: string, index: number): null | LudoSquare
```

This method is same as `.piece()` but requires piece name and piece index rather than `squareIndex` and `homeId`.

```ts
console.log(square('a', 2))
// {
//     type: 'home',
//     index: 2,
//     homeId: 0,
//     pieces: [
//         { name: 'a', index: 2 }
//     ]
// }
```

#### .next()

```ts
function next(squareIndex: number, homeId: number, findBy = -1): null | LudoSquare
```

Find the square information after any specified square. You can use third parameter according to the player homeId. If you omit the third parameter then next square will never be a `safe-end` and `goal` squares.

```ts
console.log(square(0, 0))
// {
//     type: 'safe',
//     index: 20,
//     homeId: 0,
//     pieces: []
// }

console.log(square(15, 0))
// {
//     type: 'right-way',
//     index: 21,
//     homeId: 0,
//     pieces: []
// }

console.log(square(15, 0, 0))
// {
//     type: 'safe-end',
//     index: 14,
//     homeId: 0,
//     pieces: []
// }
```

#### .prev()

```ts
function prev(
    squareIndex: number, 
    homeId: number,
    defaultIndex: number,
    findBy = -1
): null | LudoSquare
```

This method is same as `.next()` but it returns previous square information, also it has third parameter is 'defaultIndex' which means when there is no previous squareIndex, it will return `defaultIndex`. Same as `.next()`, if you omit fourth parameter then previous square will never be a `home` square.

```ts
console.log(prev(20, 0, 0))
// {
//     type: 'right-way',
//     index: 21,
//     homeId: 0,
//     pieces: []
// }

console.log(prev(20, 0, 2, 0))
// {
//     type: 'home',
//     index: 2,
//     homeId: 0,
//     pieces: [{ name: 'a', index: 2 }]
// }
```

#### .on()

```ts
interface LudoPiece {
    index: number,
    homeId: number,
    position?: number,
    name?: string
}

interface LudoSquare {
    type: 'safe' | 'home' | 'goal' | 'safe-end'
    | 'safe-way' | 'left-way' | 'right-way' | 'normal',
    index: number,
    pieces: LuoPiece[],
    homeId: number
}

type MoveType = 'move' | 'capture' | 'undo-capture' | 'undo-move'

interface LudoEvent {
    add?: (piece: LudoPiece) => void,
    init?: () => void,
    over?: (pieces: string[], lastPlayer: string) => void,
    finish?: (piece: LudoPiece) => void,
    move?: (piece: LudoPiece, from: LudoSquare, to: LudoSquare, type: MoveType) => void,
    turn?: (piece: string) => void
}

function on<E keyof LudoEvent>(event: E, handler: LudoEvent[E]): void
```

You can attach a event listener for perticular event that will be trigger by ludo.js instance.

```ts
// whenever turn chnages, will print a player name on console
on('turn', (turn) => console.log(turn)) 
```

#### .moves()

```ts
interface LudoMove {
    isInitial: boolean,
    number: number,
    from: LudoSquare,
    to: LudoSquare,
    capture: LudoPiece[],
    isRepeat: boolean,
    piece: LudoPiece
}

function moves(piece?: string, distance = 0): string | LudoMove[]
```

This method returns the available valid moves of current player. You can also pass the first parameter, If you don't want to rely on `turn`. By default a random number from 1 to 6 is used as a 'distance', but you can pass your custom number as second parameter

```ts
console.log(moves(undefined, 1)) // []

// this will print the all four available moves
console.log(moves(undefined, 6))

// this will print -> "Unknown player name or 'distance' is out of range."
console.log(moves(undefined, 7))
```

#### .move()

```ts
function move(move: LudoMove): string | undefined
```
This function move the piece from one square to another. Just pass 'move' that is returns by the `.moves()`.

```ts
// this will move first piece of player 'a' to index 20.
move(moves(undefined, 6)[0])
```

#### .position()

```ts
function position(): string
```

This method retuns the positions of pieces, numbers of player, number of homes, turn, number of captures made by perticular players in a string formate.

```ts
console.log(position()) // 'abcd//abcd/ a aa'

// let's move a piece
move(moves(undefined, 6)[0])

console.log(position()) // 'ubcd//abcd/ c aa'
```

#### .history()

```ts
function history(): string
```

This function returns the history of moves in string formate.

```ts
init({ position: 'ubcd//u0ucd/ a aa', historySize: 3 })

// let's move a piece
move(moves(undefined, 2)[0])
console.log(history()) // 'a02'

move(moves(undefined, 2)[0])
console.log(history()) // 'a02 c02.a0'
console.log(position()) // 'abcd//s0ucd a ab'
```

#### .undo()

```ts
function undo(): string | undefined
```

Undo last move.

```ts
move(moves(undefined, 6)[0])
console.log(position()) // ubcd//abcd b aa

move(moves(undefined, 6)[1])
console.log(position()) // ubcd//aucd a aa

undo(); // undo last move
console.log(position()) // ubcd//abcd b aa

undo(); // undo last move
console.log(position()) // ubcd//abcd b aa

console.log(undo()) // No more undo
```

#### .redo()

```ts
function redo(): string | undefined
```

Redo last undo move.

```ts
move(moves(undefined, 6)[0])
console.log(position()) // ubcd//abcd b aa

move(moves(undefined, 6)[1])
console.log(position()) // ubcd//aucd a aa

undo(); // undo last move
console.log(position()) // ubcd//abcd b aa

undo(); // undo last move
console.log(position()) // abcd//abcd a aa


redo()// 
console.log(position()) // ubcd//abcd b aa

move(moves(undefined, 6)[0])
console.log(position()) // ubcd//ubcd a aa

console.log(redo()) // No more redo

```