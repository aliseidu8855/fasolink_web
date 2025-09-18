// Simple concurrency limiter (pLimit-style)
// Usage:
//   const limit = pLimit(3);
//   await Promise.all(files.map(f => limit(() => upload(f))));

export function pLimit(concurrency = 3) {
  const queue = [];
  let activeCount = 0;

  const next = () => {
    activeCount--;
    if (queue.length > 0) {
      const fn = queue.shift();
      fn && fn();
    }
  };

  const run = (fn, resolve, reject) => {
    activeCount++;
    Promise.resolve()
      .then(fn)
      .then((val) => {
        resolve(val);
        next();
      })
      .catch((err) => {
        reject(err);
        next();
      });
  };

  const enqueue = (fn) =>
    new Promise((resolve, reject) => {
      const task = () => run(fn, resolve, reject);
      if (activeCount < concurrency) {
        task();
      } else {
        queue.push(task);
      }
    });

  return (fn) => enqueue(fn);
}
