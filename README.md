# mobxmotion

`mobxmotion` allows you to animate elements using `mobx` without re-rendering the parent component.

`mobxmotion.div` is a drop-in replacement for a normal `div`, except its `style` prop can include getters.

If a getter is present, the given style value will be re-evaluated and updated when mobx detects a change, but the parent component will not re-render.

```bash
yarn add mobxmotion
# or
npm install mobxmotion
# or
pnpm add mobxmotion
```

## Example

Let's say we have some observable `x` value and we want to use it to set the `transform` style of a `div`.

```tsx
import { mobxmotion } from "mobxmotion";
import { observable } from "mobx";

const x = observable.box(0);

export function Demo() {
  useSomeHeavyComputation(); // Render is expensive

  return (
    <mobxmotion.div
      style={{
        // Use getter instead of regular value
        // transform: `translate(${x.get()}px, 0)`,
        get transform() {
          return `translate(${x.get()}px, 0)`;
        },
      }}
    >
      <button
        onClick={() => {
          x.set(randomInt(0, 300));
        }}
      >
        Set random x position
      </button>
    </mobxmotion.div>
  );
}
```

When observable `x` changes, `style.transform` will be re-evaluated and updated, but the component itself will not re-render.

## Example with spring animation

In the example above, when `x` changes, the component will instantly move to the new position.

We can easily use spring animation to make the movement smooth.

The only change we need to make is to pass `x` value through `$spring` function inside the getter.

Change this:

```tsx
      style={{
        get transform() {
          const transformX = x.get();

          return `translate(${transformX}px, 0)`;
        },
      }}
```

To this:

```tsx
      style={{
        get transform() {
          const transformX = $spring(x.get());

          return `translate(${transformX}px, 0)`;
        },
      }}
```

And that's it! Now when `x` changes, transform will be animated to the new value. Component will not re-render during the animation.

The full example with spring animation:

```tsx
import { mobxmotion, $spring } from "mobxmotion";
import { observable } from "mobx";

const x = observable.box(0);

export function Demo() {
  return (
    <mobxmotion.div
      style={{
        get transform() {
          const transformX = $spring(x.get());

          return `translate(${transformX}px, 0)`;
        },
      }}
    >
      <button
        onClick={() => {
          x.set(randomInt(0, 300));
        }}
      >
        Random x position
      </button>
    </mobxmotion.div>
  );
}
```

`$spring` also accepts 2nd argument, `springConfig` which allows you to customize the spring animation.

```tsx
const SPRING_CONFIG: SpringConfigInput = {
  stiffness: 100,
  damping: 10,
  mass: 1,
};

// Inside the getter:
const transformX = $spring(x.get(), SPRING_CONFIG);
```

It is recommended to define spring config outside of the getter to make it faster for the animator to determine if the config needs to be updated.

> [!NOTE]
>
> `$spring` calls inside getters have to follow same rules as React hooks.
>
> They cannot be called conditionally, they have to be called on every getter call. You can use multiple `$spring` calls in one getter, but you have to call it the same number of times in every getter call.

---

All the other props are exactly the same as in normal `div`.

You can still use regular styles, without getters, as you would do with a normal `div`.

Every existing `div` can be replaced with `mobxmotion.div` without any changes to the code.

You can also use `mobxmotion.p`, `mobxmotion.span`, `mobxmotion.button`, etc. for every `HTML` and `SVG` element.

## License

MIT License

Copyright (c) 2024 Adam Pietrasiak

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
