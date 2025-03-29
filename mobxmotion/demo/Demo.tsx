import { $spring, mobxmotion } from "@/index";
import React, { useEffect, useRef } from "react";
import { configure, observable, runInAction } from "mobx";

configure({
  enforceActions: "always",
});

const value = observable.box(0);

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function useRendersCount() {
  const renders = useRef(1);

  useEffect(() => {
    renders.current++;
  }, []);

  return renders.current;
}

export function Demo() {
  const rendersCount = useRendersCount();

  return (
    <mobxmotion.div
      style={{
        willChange: "transform",
        get x() {
          return $spring(value.get());
        },
      }}
    >
      <button
        onClick={() => {
          runInAction(() => {
            value.set(randomInt(0, 300));
          });
        }}
      >
        Random
      </button>
      <div>Renders: {rendersCount}</div>
    </mobxmotion.div>
  );
}
