# 🐕 Dogs of Cursor Racing Game 🐕

A fun React-based racing game where five adorable dogs race through the streets of North Beach, San Francisco!

## The Dogs

- **Louie** - A very small brown Maltipoo
- **Freddy** - A small white Poodle
- **Olive** - A cream Golden Retriever
- **Gary Pancakes** - A brown Dachshund
- **Iko** - A golden Golden Retriever

## How to Play

1. Click the "Start Race!" button to begin the race
2. Click on any dog during the race to feed them a treat
3. Feeding treats gives dogs a temporary speed boost (2.5x speed for 2 seconds)
4. The first dog to reach the finish line wins!
5. Click "Race Again!" to start a new race

## Features

- Real-time racing animation using `requestAnimationFrame`
- Interactive treat-feeding mechanic - click any dog to boost their speed
- Visual feedback with bone emoji when dogs are boosted
- Cute dog illustrations with different colors and sizes
- North Beach, San Francisco themed race track
- Winner announcement with celebration animation
- Responsive design

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher

### Installation

```bash
npm install
```

### Running the Game

```bash
npm run dev
```

Then open your browser to the local development server URL (typically http://localhost:5173)

### Building for Production

```bash
npm run build
```

## Technologies Used

- React 18
- TypeScript
- Vite
- CSS3 with animations

## Game Mechanics

- **Base Speed**: Each dog moves at a base speed with random variance
- **Treat Boost**: Clicking a dog multiplies their speed by 2.5x for 2 seconds
- **Random Variance**: Speed has ±10% random variance to make races unpredictable
- **Win Condition**: First dog to reach 100% position wins

Enjoy the race! 🏁
