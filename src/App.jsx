import { useEffect, useState } from 'react'
import HandTracker from './HandTracker'
import milkFrame from './assets/FRAMES/F1.png'
import podiFrame from './assets/FRAMES/F2.png'
import endFrame from './assets/FRAMES/F3.png'
import badEnding from './assets/ENDING/BAD.mp4'
import medEnding from './assets/ENDING/MED.mp4'
import goodEnding from './assets/ENDING/GOOD.mp4'

const Frames = [milkFrame, podiFrame, endFrame];
const endings = { BAD: badEnding, MED: medEnding, GOOD: goodEnding };


const App = () => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [score, setScore] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [notice, setNotice] = useState('');
  const [ending, setEnding] = useState(null);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(''), 2200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    setNotice(currentFrame !== 2 ? 'SHOW ATLEAST ONE HAND HERE' : 'SHOW BOTH HANDS TO POUR');
  }, [currentFrame]);

  const handleEnding = (endingName) => {
    setCurrentFrame(0);
    setCountdown(null);
    setEnding(endingName);
  };

  const handleReset = () => {
    setCurrentFrame(0);
    setScore(0);
    setCountdown(null);
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <img src={Frames[currentFrame]} alt="FRAME OF CHAYAKKADA" 
      className={`absolute top-0 left-0 h-screen z-11 transition-all duration-500 ease-in-out
      ${currentFrame === 2 ? 'scale-170' : 'scale-100'}`} />
      {countdown !== null && <div className="countdown">{countdown}</div>}
      {notice && <div className="notice">{notice}</div>}
      {ending && (
        <div className="ending-overlay">
          <video
            key={ending}
            src={endings[ending]}
            autoPlay
            playsInline
            onEnded={() => {
              window.location.reload();
            }}
          />
        </div>
      )}
      <HandTracker
        currentFrame={currentFrame}
        onFrameChange={setCurrentFrame}
        onScoreChange={setScore}
        onCountdownChange={setCountdown}
        onNotice={setNotice}
        onEnding={handleEnding}
        onReset={handleReset}
      />
      <div className="score">{score}</div>
    </main>
  )
}

export default App