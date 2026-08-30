export function GameOver({ score }: { score: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '2rem',
      }}
    >
      <p>Game Over</p>
      <p>Score: {score}</p>
    </div>
  );
}
