import { useState } from "react";
import type { JSX } from "react/jsx-runtime";

export default function Info(): JSX.Element {
  const [countValue, setCountValue] = useState<number>(0);
  const increment = () => setCountValue(countValue + 1);
  const decrement = () => setCountValue(countValue - 1);

  return (
    <div>
      <h2>info</h2>
      <p>{document.location.origin}</p>

      <h2>Count Value: {countValue}</h2>
      <button onClick={decrement}>-1</button>
      <button onClick={increment}>+1</button>
    </div>
  );
}
