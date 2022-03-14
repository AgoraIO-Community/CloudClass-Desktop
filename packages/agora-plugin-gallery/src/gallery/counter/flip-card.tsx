import React from 'react';
import './flipcard.css';

const FlipCard = ({ number = 0, caution = false }: { number: number; caution: boolean }) => {
  const [frontNum, setFront] = React.useState<number>(0);
  const [backNum, setBack] = React.useState<number>(0);
  const [go, setGo] = React.useState('');
  const numberRef = React.useRef<number>(number);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    setBack(number);
    setFront(numberRef.current);
    setGo('go');
    timerRef.current = setTimeout(() => {
      setGo('');
      setBack(numberRef.current);
      setFront(number);
      numberRef.current = number;
    }, 900);

    return () => {
      setGo('');
      timerRef.current && clearTimeout(timerRef.current);
    };
  }, [number]);

  return (
    <div className={`flip-card down ${go}`} style={caution ? { color: 'red' } : {}}>
      <div className={`flip-card-front flip-card-digital number${frontNum}`}></div>
      <div className={`flip-card-back flip-card-digital number${backNum}`}></div>
    </div>
  );
};
export default FlipCard;
