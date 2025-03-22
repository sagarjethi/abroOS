'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function Calculator() {
  const [display, setDisplay] = useState('0');
  const [operator, setOperator] = useState<string | null>(null);
  const [firstNumber, setFirstNumber] = useState<number | null>(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    const current = parseFloat(display);
    if (firstNumber === null) {
      setFirstNumber(current);
    } else if (operator) {
      const result = calculate(firstNumber, current, operator);
      setDisplay(result.toString());
      setFirstNumber(result);
    }
    setOperator(op);
    setNewNumber(true);
  };

  const calculate = (first: number, second: number, op: string): number => {
    switch (op) {
      case '+':
        return first + second;
      case '-':
        return first - second;
      case '*':
        return first * second;
      case '/':
        return first / second;
      default:
        return second;
    }
  };

  const handleEqual = () => {
    const current = parseFloat(display);
    if (operator && firstNumber !== null) {
      const result = calculate(firstNumber, current, operator);
      setDisplay(result.toString());
      setFirstNumber(null);
      setOperator(null);
      setNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setOperator(null);
    setFirstNumber(null);
    setNewNumber(true);
  };

  return (
    <div className="grid grid-cols-4 gap-2 p-4">
      <div className="col-span-4 bg-muted p-4 rounded-lg mb-2">
        <span className="text-2xl font-mono">{display}</span>
      </div>
      <Button onClick={handleClear} className="col-span-2">C</Button>
      <Button onClick={() => handleOperator('/')}>/</Button>
      <Button onClick={() => handleOperator('*')}>×</Button>
      <Button onClick={() => handleNumber('7')}>7</Button>
      <Button onClick={() => handleNumber('8')}>8</Button>
      <Button onClick={() => handleNumber('9')}>9</Button>
      <Button onClick={() => handleOperator('-')}>-</Button>
      <Button onClick={() => handleNumber('4')}>4</Button>
      <Button onClick={() => handleNumber('5')}>5</Button>
      <Button onClick={() => handleNumber('6')}>6</Button>
      <Button onClick={() => handleOperator('+')}>+</Button>
      <Button onClick={() => handleNumber('1')}>1</Button>
      <Button onClick={() => handleNumber('2')}>2</Button>
      <Button onClick={() => handleNumber('3')}>3</Button>
      <Button onClick={handleEqual} className="row-span-2">=</Button>
      <Button onClick={() => handleNumber('0')} className="col-span-2">0</Button>
      <Button onClick={() => handleNumber('.')}>.</Button>
    </div>
  );
} 