# Chess MCQ - Chess Platform

A chess platform built with Next.js, Supabase, shadcn/ui, and Tailwind CSS.

## Features

- 🎨 Modern UI with shadcn/ui and Tailwind CSS
- 🔐 Authentication with Supabase
- ♟️ Reusable Chess Components:
  - **ChessBoard**: Interactive chess board using react-chessboard
  - **ChessEngine**: Stockfish integration for computer opponents
  - **ChessRules**: Chess.js integration for game rules and validation

## Design System

This project uses **shadcn/ui** and **Tailwind CSS** as the design system. All components follow the design system principles:
- Consistent styling with Tailwind utility classes
- shadcn/ui components for UI elements
- Dark mode support
- Responsive design

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chess_mcq
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Chess Components

### ChessBoard Component

A reusable chess board component built with react-chessboard.

```tsx
import { ChessBoard } from '@/components/chess'

<ChessBoard
  position="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  boardOrientation="white"
  onMove={(from, to) => {
    console.log(`Move from ${from} to ${to}`)
    return true // Return false to prevent the move
  }}
  arePiecesDraggable={true}
  showBoardNotation={true}
/>
```

### ChessEngine Hook

Integrate Stockfish chess engine for computer opponents.

```tsx
import { useChessEngine } from '@/components/chess'
import { Chess } from 'chess.js'

function MyComponent() {
  const game = new Chess()
  
  const { calculateBestMove, isThinking, evaluation } = useChessEngine({
    game,
    depth: 15,
    timeLimit: 2000, // milliseconds
    onBestMove: (move) => {
      console.log('Best move:', move)
      // Apply the move to your game
    },
    onEvaluation: (score) => {
      console.log('Position evaluation:', score)
    },
    enabled: true,
  })

  // Calculate best move
  calculateBestMove(game.fen())
  
  return (
    <div>
      {isThinking && <p>Engine is thinking...</p>}
      {evaluation && <p>Evaluation: {evaluation.score}</p>}
    </div>
  )
}
```

### ChessRules Class

Comprehensive chess rules and validation using chess.js.

```tsx
import { ChessRules } from '@/components/chess'

const rules = new ChessRules()

// Check if a move is valid
const isValid = rules.isValidMove('e2', 'e4')

// Make a move
try {
  const move = rules.makeMove('e2', 'e4')
  console.log('Move made:', move)
} catch (error) {
  console.error('Invalid move:', error)
}

// Get game state
const gameState = rules.getGameState()
console.log('Is check:', gameState.isCheck)
console.log('Is checkmate:', gameState.isCheckmate)

// Get all valid moves
const validMoves = rules.getAllValidMoves()

// Or use the hook
import { useChessRules } from '@/components/chess'

function MyComponent() {
  const rules = useChessRules()
  // Use rules as above
}
```

## Project Structure

```
chess_mcq/
├── app/
│   ├── login/          # Login page
│   ├── signup/         # Signup page
│   └── layout.tsx      # Root layout
├── components/
│   ├── chess/          # Chess components
│   │   ├── ChessBoard.tsx
│   │   ├── ChessEngine.tsx
│   │   └── ChessRules.tsx
│   └── ui/             # shadcn/ui components
├── hooks/
│   └── useChessGame.ts # Chess game state hook
├── lib/
│   ├── supabase/       # Supabase client
│   └── utils.ts        # Utility functions
└── public/             # Static assets
```

## Design System Guidelines

When adding new components or features:

1. **Use shadcn/ui components** for UI elements (Button, Card, Input, etc.)
2. **Use Tailwind CSS** for styling
3. **Follow the existing design patterns** in login/signup pages
4. **Maintain consistency** with the design system across all pages
5. **Ensure responsive design** for mobile and desktop

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## License

MIT
