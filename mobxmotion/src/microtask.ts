export function microtask(task?: VoidFunction) {
  return new Promise<void>((resolve) => {
    queueMicrotask(() => {
      try {
        task?.();
      } finally {
        resolve();
      }
    });
  });
}

interface PendingMicrotask {
  promise: Promise<void>;
  tasks: VoidFunction[];
}

export function createMicrotaskGroup() {
  let pendingTasks: PendingMicrotask | null = null;

  return function microtask(task?: VoidFunction) {
    if (pendingTasks) {
      if (task) {
        pendingTasks.tasks.push(task);
      }
      return pendingTasks.promise;
    }

    const promise = new Promise<void>((resolve) => {
      queueMicrotask(() => {
        const pendingTasksPrev = pendingTasks!;
        pendingTasks = null;

        for (const task of pendingTasksPrev.tasks) {
          try {
            task();
          } catch (error) {
            console.error(error);
          }
        }

        resolve();
      });
    });

    pendingTasks = {
      promise,
      tasks: task ? [task] : [],
    };

    return promise;
  };
}
