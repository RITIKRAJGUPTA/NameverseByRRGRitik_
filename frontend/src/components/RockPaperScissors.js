import React, { useState } from 'react';

export default function RockPaperScissors() {
  const choices = ['rock', 'paper', 'scissors'];
  const [userChoice, setUserChoice] = useState('');
  const [computerChoice, setComputerChoice] = useState('');
  const [result, setResult] = useState('');

  const playGame = (choice) => {
    const compChoice = choices[Math.floor(Math.random() * choices.length)];
    setUserChoice(choice);
    setComputerChoice(compChoice);

    if (choice === compChoice) setResult('It\'s a draw!');
    else if (
      (choice === 'rock' && compChoice === 'scissors') ||
      (choice === 'paper' && compChoice === 'rock') ||
      (choice === 'scissors' && compChoice === 'paper')
    ) setResult('You win!');
    else setResult('You lose!');
  };

  return (
    <div className="container mt-5 pt-5 text-center">
      <h2>Rock Paper Scissors</h2>
      {choices.map(c => (
        <button key={c} className="btn btn-outline-primary m-2" onClick={() => playGame(c)}>{c}</button>
      ))}
      <div className="mt-3">
        <p>You chose: {userChoice}</p>
        <p>Computer chose: {computerChoice}</p>
        <h4>{result}</h4>
      </div>
    </div>
  );
}
