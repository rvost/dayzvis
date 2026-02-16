export function maxBy(array: object[], pluck): object {
  return array.reduce(function (best, next) {
    const pair = [pluck(next), next];
    if (!best) {
      return pair;
    } else if (Math.max(best[0], pair[0]) == best[0]) {
      return best;
    } else {
      return pair;
    }
  }, null)[1];
}

export function range(start: number, stop: number | undefined, step: number | undefined) {
  if (typeof stop == "undefined") {
    stop = start;
    start = 0;
  }

  if (typeof step == "undefined") {
    step = 1;
  }

  if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
    return [];
  }

  const result = [];
  for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
    result.push(i);
  }

  return result;
}

export function clampToSimulationRate(x: number) {
  const step = 0.033;
  const n = Math.ceil(x / step);
  return Math.min(1, Math.max(0, n * step));
}
export function speedAtDistance(v0: number, x: number, airFriction: number) {
  return v0 * Math.exp(airFriction * x);
}

export function bulletDamage(damage: number, speed: number, dropOffSpeed: number) {
  return speed >= dropOffSpeed ? damage : damage * (speed / dropOffSpeed);
}
